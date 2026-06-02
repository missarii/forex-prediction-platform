package com.forex.platform.bet;

import com.forex.platform.domain.Bet;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BetRepository extends JpaRepository<Bet, Long> {
    List<Bet> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Bet> findByStatus(String status);
}
