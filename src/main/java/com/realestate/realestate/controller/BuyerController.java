package com.realestate.realestate.controller;

import com.realestate.realestate.service.DealService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/buyer")
public class BuyerController {

    private final DealService dealService;

    public BuyerController(DealService dealService) {
        this.dealService = dealService;
    }

    // Buyer buys a property (dummy payment logic)
    @PostMapping("/buy/{propertyId}/buyer/{buyerId}")
    public String buyProperty(@PathVariable Long propertyId,
                              @PathVariable Long buyerId) {
        return dealService.finalizeDeal(propertyId, buyerId);
    }
}
