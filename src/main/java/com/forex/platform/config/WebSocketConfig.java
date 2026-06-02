package com.forex.platform.config;

import com.forex.platform.market.PriceWebSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final PriceWebSocketHandler priceWebSocketHandler;

    public WebSocketConfig(PriceWebSocketHandler priceWebSocketHandler) {
        this.priceWebSocketHandler = priceWebSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(priceWebSocketHandler, "/ws/prices")
                .setAllowedOrigins("*");
    }
}
