package com.forex.platform.wallet;

import com.forex.platform.domain.Wallet;
import com.forex.platform.domain.Transaction;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class WalletService {

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;

    public WalletService(WalletRepository walletRepository, TransactionRepository transactionRepository) {
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
    }

    public Wallet getWalletByUserId(Long userId) {
        return walletRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Wallet not found for user: " + userId));
    }

    @Transactional
    public Wallet deposit(Long userId, Double amount) {
        if (amount <= 0) throw new IllegalArgumentException("Deposit amount must be positive");
        
        int retries = 3;
        while (retries > 0) {
            try {
                Wallet wallet = getWalletByUserId(userId);
                wallet.setBalance(wallet.getBalance() + amount);
                Wallet updated = walletRepository.save(wallet);

                transactionRepository.save(new Transaction(
                        userId, "DEPOSIT", amount, "Wallet Mock Deposit"
                ));
                return updated;
            } catch (ObjectOptimisticLockingFailureException e) {
                retries--;
                if (retries == 0) throw e;
                try { Thread.sleep(100); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); }
            }
        }
        throw new IllegalStateException("Failed to complete deposit due to concurrent conflicts");
    }

    @Transactional
    public Wallet withdraw(Long userId, Double amount) {
        if (amount <= 0) throw new IllegalArgumentException("Withdrawal amount must be positive");

        int retries = 3;
        while (retries > 0) {
            try {
                Wallet wallet = getWalletByUserId(userId);
                if (wallet.getBalance() < amount) {
                    throw new IllegalArgumentException("Insufficient balance");
                }
                wallet.setBalance(wallet.getBalance() - amount);
                Wallet updated = walletRepository.save(wallet);

                transactionRepository.save(new Transaction(
                        userId, "WITHDRAW", amount, "Wallet Simulated Cashout"
                ));
                return updated;
            } catch (ObjectOptimisticLockingFailureException e) {
                retries--;
                if (retries == 0) throw e;
                try { Thread.sleep(100); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); }
            }
        }
        throw new IllegalStateException("Failed to complete withdrawal due to concurrent conflicts");
    }

    public List<Transaction> getTransactions(Long userId) {
        return transactionRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
}
