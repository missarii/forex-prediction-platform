package com.forex.platform.settlement;

import com.forex.platform.domain.Bet;
import com.forex.platform.domain.Wallet;
import com.forex.platform.domain.Transaction;
import com.forex.platform.bet.BetRepository;
import com.forex.platform.market.PriceProcessingPool;
import com.forex.platform.wallet.WalletRepository;
import com.forex.platform.wallet.TransactionRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
public class SettlementEngine {

    private final BetRepository betRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final PriceProcessingPool pricePool;

    // Concurrency: 50 worker threads for processing settlements in parallel
    private final ExecutorService settlementWorkers = Executors.newFixedThreadPool(50);

    public SettlementEngine(BetRepository betRepository, WalletRepository walletRepository,
                            TransactionRepository transactionRepository, PriceProcessingPool pricePool) {
        this.betRepository = betRepository;
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
        this.pricePool = pricePool;
    }

    // Every second, check and settle expired predictions
    @Scheduled(fixedDelay = 1000)
    public void scanAndSettle() {
        List<Bet> activeBets = betRepository.findByStatus("ACTIVE");
        LocalDateTime now = LocalDateTime.now();

        for (Bet bet : activeBets) {
            LocalDateTime expirationTime = bet.getCreatedAt().plusSeconds(bet.getDurationSeconds());
            
            // Check if prediction duration has elapsed
            if (expirationTime.isBefore(now) || expirationTime.isEqual(now)) {
                // Delegate to 50-thread worker pool
                settlementWorkers.submit(() -> settlePrediction(bet));
            }
        }
    }

    // Thread-safe prediction resolution
    @Transactional
    public void settlePrediction(Bet bet) {
        try {
            // Fetch live price when expired
            Double exitPrice = pricePool.getLivePrice(bet.getSymbol());
            Double entryPrice = bet.getEntryPrice();
            
            // Determine result
            boolean isWin;
            if ("UP".equalsIgnoreCase(bet.getDirection())) {
                isWin = exitPrice > entryPrice;
            } else {
                isWin = exitPrice < entryPrice;
            }

            String nextStatus = isWin ? "WON" : "LOST";
            double payout = isWin ? bet.getAmount() * 1.85 : 0.0;

            // 1. Update Wallet Balance if Won
            if (isWin) {
                Wallet wallet = walletRepository.findByUserId(bet.getUserId())
                        .orElseThrow(() -> new IllegalArgumentException("Wallet not found for user: " + bet.getUserId()));
                
                wallet.setBalance(wallet.getBalance() + payout);
                walletRepository.save(wallet);

                // Add payout log
                transactionRepository.save(new Transaction(
                        bet.getUserId(), "BET_PAYOUT", payout, 
                        String.format("Prediction Settlement WIN on %s", bet.getSymbol())
                ));
            }

            // 2. Update Bet Status
            bet.setExitPrice(exitPrice);
            bet.setStatus(nextStatus);
            bet.setSettledAt(LocalDateTime.now());
            betRepository.save(bet);

            System.out.printf("[Settlement Worker] Resolved Bet ID %d (%s) - %s (Entry: %.4f, Exit: %.4f) Result: %s Payout: $%.2f%n",
                    bet.getId(), bet.getSymbol(), bet.getDirection(), entryPrice, exitPrice, nextStatus, payout
            );

        } catch (Exception e) {
            System.err.println("Error settling bet ID " + bet.getId() + ": " + e.getMessage());
        }
    }
}
