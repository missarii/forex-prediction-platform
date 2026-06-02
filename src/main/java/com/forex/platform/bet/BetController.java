package com.forex.platform.bet;

import com.forex.platform.domain.Bet;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/bets")
@CrossOrigin(origins = "*")
public class BetController {

    private final BetService betService;

    public BetController(BetService betService) {
        this.betService = betService;
    }

    @PostMapping("/place")
    public ResponseEntity<?> placeBet(@RequestBody Map<String, Object> payload) {
        try {
            Long userId = Long.valueOf(payload.get("userId").toString());
            String symbol = payload.get("symbol").toString();
            String direction = payload.get("direction").toString();
            Double amount = Double.valueOf(payload.get("amount").toString());
            Integer durationSeconds = Integer.valueOf(payload.get("durationSeconds").toString());

            Bet bet = betService.placeBet(userId, symbol, direction, amount, durationSeconds);
            return ResponseEntity.ok(bet);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserBets(@PathVariable Long userId) {
        return ResponseEntity.ok(betService.getUserBets(userId));
    }
}
