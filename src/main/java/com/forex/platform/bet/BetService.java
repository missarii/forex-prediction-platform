package com.forex.platform.bet;

import com.forex.platform.domain.Bet;
import com.forex.platform.domain.Wallet;
import com.forex.platform.domain.Transaction;
import com.forex.platform.market.PriceProcessingPool;
import com.forex.platform.wallet.WalletRepository;
import com.forex.platform.wallet.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class BetService {

    private final BetRepository betRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final PriceProcessingPool pricePool;

    public BetService(BetRepository betRepository, WalletRepository walletRepository,
                      TransactionRepository transactionRepository, PriceProcessingPool pricePool) {
        this.betRepository = betRepository;
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
        this.pricePool = pricePool;
    }

    @Transactional
    public Bet placeBet(Long userId, String symbol, String direction, Double amount, Integer durationSeconds) {
        if (amount <= 0) throw new IllegalArgumentException("Bet amount must be positive");
        if (durationSeconds <= 0) throw new IllegalArgumentException("Duration must be positive");

        // 1. Fetch wallet and check balance
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Wallet not found for user: " + userId));
        
        if (wallet.getBalance() < amount) {
            throw new IllegalArgumentException("Insufficient wallet balance");
        }

        // 2. Fetch current entry price
        Double entryPrice = pricePool.getLivePrice(symbol);

        // 3. Deduct balance from wallet
        wallet.setBalance(wallet.getBalance() - amount);
        walletRepository.save(wallet);

        // 4. Create and save Bet
        Bet bet = new Bet(userId, symbol, direction, amount, entryPrice, durationSeconds);
        Bet savedBet = betRepository.save(bet);

        // 5. Create audit transaction log
        transactionRepository.save(new Transaction(
                userId, "BET_STAKE", amount, String.format("Opened %s prediction on %s", direction, symbol)
        ));

        return savedBet;
    }

    public List<Bet> getUserBets(Long userId) {
        return betRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
}
