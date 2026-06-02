package com.forex.platform.user;

import com.forex.platform.domain.User;
import com.forex.platform.domain.Wallet;
import com.forex.platform.wallet.WalletRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;

    public UserService(UserRepository userRepository, WalletRepository walletRepository) {
        this.userRepository = userRepository;
        this.walletRepository = walletRepository;
    }

    @Transactional
    public User getOrCreateUser(String username) {
        return userRepository.findByUsername(username)
                .orElseGet(() -> {
                    // Create User
                    User newUser = userRepository.save(new User(username));
                    // Initialize Wallet with default balance $5,000
                    walletRepository.save(new Wallet(newUser.getId(), 5000.0));
                    return newUser;
                });
    }
}
