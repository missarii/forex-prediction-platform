package com.forex.platform.market;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.concurrent.*;

@Service
public class PriceProcessingPool {

    private final PriceWebSocketHandler webSocketHandler;
    
    // Core 20-thread pool for price generation tasks
    private final ExecutorService executor = Executors.newFixedThreadPool(20);

    // Thread-safe live rates cache
    private final Map<String, Double> prices = new ConcurrentHashMap<>();

    private static final String[] SYMBOLS = {"EUR/USD", "GBP/USD", "USD/JPY", "BTC/USD", "ETH/USD", "XAU/USD"};

    public PriceProcessingPool(PriceWebSocketHandler webSocketHandler) {
        this.webSocketHandler = webSocketHandler;
        
        // Setup initial pricing markers
        prices.put("EUR/USD", 1.0854);
        prices.put("GBP/USD", 1.2642);
        prices.put("USD/JPY", 156.45);
        prices.put("BTC/USD", 68420.5);
        prices.put("ETH/USD", 3820.75);
        prices.put("XAU/USD", 2342.3);
    }

    public Double getLivePrice(String symbol) {
        return prices.getOrDefault(symbol, 1.0);
    }

    // Every second, execute price changes concurrently in our 20-thread executor pool
    @Scheduled(fixedDelay = 1000)
    public void tickPrices() {
        for (String symbol : SYMBOLS) {
            executor.submit(() -> {
                double currentPrice = prices.get(symbol);
                
                // Add minor random Brownian motion volatility
                double volatility = symbol.contains("USD") ? 0.0003 : symbol.contains("JPY") ? 0.05 : 2.5;
                double drift = (ThreadLocalRandom.current().nextDouble() - 0.495) * volatility;
                double nextPrice = currentPrice + drift;

                if (nextPrice <= 0) nextPrice = 0.0001;

                prices.put(symbol, nextPrice);

                // Build and Broadcast JSON payload
                String payload = String.format(
                        "{\"symbol\":\"%s\",\"price\":%.5f,\"timestamp\":%d}",
                        symbol, nextPrice, System.currentTimeMillis() / 1000
                );
                webSocketHandler.broadcast(payload);
            });
        }
    }
}
