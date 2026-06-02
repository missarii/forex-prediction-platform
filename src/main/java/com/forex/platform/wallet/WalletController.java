package com.forex.platform.wallet;

import com.forex.platform.domain.Wallet;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
@CrossOrigin(origins = "*")
public class WalletController {

    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getWallet(@PathVariable Long userId) {
        try {
            Wallet wallet = walletService.getWalletByUserId(userId);
            return ResponseEntity.ok(wallet);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{userId}/deposit")
    public ResponseEntity<?> deposit(@PathVariable Long userId, @RequestBody Map<String, Double> payload) {
        Double amount = payload.get("amount");
        if (amount == null || amount <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid deposit amount"));
        }
        try {
            Wallet wallet = walletService.deposit(userId, amount);
            return ResponseEntity.ok(wallet);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{userId}/withdraw")
    public ResponseEntity<?> withdraw(@PathVariable Long userId, @RequestBody Map<String, Double> payload) {
        Double amount = payload.get("amount");
        if (amount == null || amount <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid withdrawal amount"));
        }
        try {
            Wallet wallet = walletService.withdraw(userId, amount);
            return ResponseEntity.ok(wallet);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{userId}/transactions")
    public ResponseEntity<?> getTransactions(@PathVariable Long userId) {
        return ResponseEntity.ok(walletService.getTransactions(userId));
    }
}
