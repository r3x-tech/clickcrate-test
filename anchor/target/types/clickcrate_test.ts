export type ClickcrateTest = {
  "version": "0.3.0",
  "name": "clickcrate_test",
  "instructions": [
    {
      "name": "registerClickcrate",
      "accounts": [
        {
          "name": "clickcrate",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "id",
          "type": "publicKey"
        },
        {
          "name": "eligiblePlacementType",
          "type": {
            "defined": "PlacementType"
          }
        },
        {
          "name": "eligibleProductCategory",
          "type": {
            "defined": "ProductCategory"
          }
        },
        {
          "name": "manager",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "updateClickcrate",
      "accounts": [
        {
          "name": "clickcrate",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "id",
          "type": "publicKey"
        },
        {
          "name": "eligiblePlacementType",
          "type": {
            "defined": "PlacementType"
          }
        },
        {
          "name": "eligibleProductCategory",
          "type": {
            "defined": "ProductCategory"
          }
        },
        {
          "name": "manager",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "registerProductListing",
      "accounts": [
        {
          "name": "productListing",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "id",
          "type": "publicKey"
        },
        {
          "name": "origin",
          "type": {
            "defined": "Origin"
          }
        },
        {
          "name": "placementType",
          "type": {
            "defined": "PlacementType"
          }
        },
        {
          "name": "productCategory",
          "type": {
            "defined": "ProductCategory"
          }
        },
        {
          "name": "inStock",
          "type": "u64"
        },
        {
          "name": "manager",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "updateProductListing",
      "accounts": [
        {
          "name": "productListing",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newPlacementType",
          "type": {
            "defined": "PlacementType"
          }
        },
        {
          "name": "newProductCategory",
          "type": {
            "defined": "ProductCategory"
          }
        },
        {
          "name": "newManager",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "activateClickcrate",
      "accounts": [
        {
          "name": "clickcrate",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "deactivateClickcrate",
      "accounts": [
        {
          "name": "clickcrate",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "activateProductListing",
      "accounts": [
        {
          "name": "productListing",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "deactivateProductListing",
      "accounts": [
        {
          "name": "productListing",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "placeProductListing",
      "accounts": [
        {
          "name": "clickcrate",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "productId",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "removeProductListing",
      "accounts": [
        {
          "name": "clickcrate",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "makePurchase",
      "accounts": [
        {
          "name": "clickcrate",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "productListing",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "productId",
          "type": "publicKey"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "clickCrateState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "publicKey"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "manager",
            "type": "publicKey"
          },
          {
            "name": "eligiblePlacementType",
            "type": {
              "defined": "PlacementType"
            }
          },
          {
            "name": "eligibleProductCategory",
            "type": {
              "defined": "ProductCategory"
            }
          },
          {
            "name": "product",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "isActive",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "productListingState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "publicKey"
          },
          {
            "name": "origin",
            "type": {
              "defined": "Origin"
            }
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "manager",
            "type": "publicKey"
          },
          {
            "name": "placementType",
            "type": {
              "defined": "PlacementType"
            }
          },
          {
            "name": "productCategory",
            "type": {
              "defined": "ProductCategory"
            }
          },
          {
            "name": "inStock",
            "type": "u64"
          },
          {
            "name": "sold",
            "type": "u64"
          },
          {
            "name": "isActive",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "PlacementType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "DigitalReplica"
          },
          {
            "name": "RelatedPurchase"
          },
          {
            "name": "TargetedPlacement"
          }
        ]
      }
    },
    {
      "name": "ProductCategory",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Clothing"
          },
          {
            "name": "Electronics"
          },
          {
            "name": "Books"
          },
          {
            "name": "Home"
          },
          {
            "name": "Beauty"
          },
          {
            "name": "Toys"
          },
          {
            "name": "Sports"
          },
          {
            "name": "Automotive"
          },
          {
            "name": "Grocery"
          },
          {
            "name": "Health"
          }
        ]
      }
    },
    {
      "name": "Origin",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Clickcrate"
          },
          {
            "name": "Shopify"
          },
          {
            "name": "Square"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "ClickCrateExists",
      "msg": "ClickCrate has already been registered"
    },
    {
      "code": 6001,
      "name": "ClickCrateActivated",
      "msg": "ClickCrate already actived!"
    },
    {
      "code": 6002,
      "name": "ClickCrateDeactivated",
      "msg": "ClickCrate already deactived!"
    },
    {
      "code": 6003,
      "name": "InvalidClickCrateRegistration",
      "msg": "Invalid clickcrate registration"
    },
    {
      "code": 6004,
      "name": "ProductNotFound",
      "msg": "Product Listing was not found"
    },
    {
      "code": 6005,
      "name": "ProductListingExists",
      "msg": "Product Listing has already been registered"
    },
    {
      "code": 6006,
      "name": "ProductListingActivated",
      "msg": "Product Listing already actived!"
    },
    {
      "code": 6007,
      "name": "ProductListingDeactivated",
      "msg": "Product Listing already deactived!"
    },
    {
      "code": 6008,
      "name": "ProductOutOfStock",
      "msg": "The product is out of stock"
    },
    {
      "code": 6009,
      "name": "InvalidProductListingRegistration",
      "msg": "Invalid clickcrate registration"
    },
    {
      "code": 6010,
      "name": "PurchaseFailed",
      "msg": "Purchase did not go through"
    }
  ]
};

export const IDL: ClickcrateTest = {
  "version": "0.3.0",
  "name": "clickcrate_test",
  "instructions": [
    {
      "name": "registerClickcrate",
      "accounts": [
        {
          "name": "clickcrate",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "id",
          "type": "publicKey"
        },
        {
          "name": "eligiblePlacementType",
          "type": {
            "defined": "PlacementType"
          }
        },
        {
          "name": "eligibleProductCategory",
          "type": {
            "defined": "ProductCategory"
          }
        },
        {
          "name": "manager",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "updateClickcrate",
      "accounts": [
        {
          "name": "clickcrate",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "id",
          "type": "publicKey"
        },
        {
          "name": "eligiblePlacementType",
          "type": {
            "defined": "PlacementType"
          }
        },
        {
          "name": "eligibleProductCategory",
          "type": {
            "defined": "ProductCategory"
          }
        },
        {
          "name": "manager",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "registerProductListing",
      "accounts": [
        {
          "name": "productListing",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "id",
          "type": "publicKey"
        },
        {
          "name": "origin",
          "type": {
            "defined": "Origin"
          }
        },
        {
          "name": "placementType",
          "type": {
            "defined": "PlacementType"
          }
        },
        {
          "name": "productCategory",
          "type": {
            "defined": "ProductCategory"
          }
        },
        {
          "name": "inStock",
          "type": "u64"
        },
        {
          "name": "manager",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "updateProductListing",
      "accounts": [
        {
          "name": "productListing",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newPlacementType",
          "type": {
            "defined": "PlacementType"
          }
        },
        {
          "name": "newProductCategory",
          "type": {
            "defined": "ProductCategory"
          }
        },
        {
          "name": "newManager",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "activateClickcrate",
      "accounts": [
        {
          "name": "clickcrate",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "deactivateClickcrate",
      "accounts": [
        {
          "name": "clickcrate",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "activateProductListing",
      "accounts": [
        {
          "name": "productListing",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "deactivateProductListing",
      "accounts": [
        {
          "name": "productListing",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "placeProductListing",
      "accounts": [
        {
          "name": "clickcrate",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "productId",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "removeProductListing",
      "accounts": [
        {
          "name": "clickcrate",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "makePurchase",
      "accounts": [
        {
          "name": "clickcrate",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "productListing",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "productId",
          "type": "publicKey"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "clickCrateState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "publicKey"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "manager",
            "type": "publicKey"
          },
          {
            "name": "eligiblePlacementType",
            "type": {
              "defined": "PlacementType"
            }
          },
          {
            "name": "eligibleProductCategory",
            "type": {
              "defined": "ProductCategory"
            }
          },
          {
            "name": "product",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "isActive",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "productListingState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "publicKey"
          },
          {
            "name": "origin",
            "type": {
              "defined": "Origin"
            }
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "manager",
            "type": "publicKey"
          },
          {
            "name": "placementType",
            "type": {
              "defined": "PlacementType"
            }
          },
          {
            "name": "productCategory",
            "type": {
              "defined": "ProductCategory"
            }
          },
          {
            "name": "inStock",
            "type": "u64"
          },
          {
            "name": "sold",
            "type": "u64"
          },
          {
            "name": "isActive",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "PlacementType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "DigitalReplica"
          },
          {
            "name": "RelatedPurchase"
          },
          {
            "name": "TargetedPlacement"
          }
        ]
      }
    },
    {
      "name": "ProductCategory",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Clothing"
          },
          {
            "name": "Electronics"
          },
          {
            "name": "Books"
          },
          {
            "name": "Home"
          },
          {
            "name": "Beauty"
          },
          {
            "name": "Toys"
          },
          {
            "name": "Sports"
          },
          {
            "name": "Automotive"
          },
          {
            "name": "Grocery"
          },
          {
            "name": "Health"
          }
        ]
      }
    },
    {
      "name": "Origin",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Clickcrate"
          },
          {
            "name": "Shopify"
          },
          {
            "name": "Square"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "ClickCrateExists",
      "msg": "ClickCrate has already been registered"
    },
    {
      "code": 6001,
      "name": "ClickCrateActivated",
      "msg": "ClickCrate already actived!"
    },
    {
      "code": 6002,
      "name": "ClickCrateDeactivated",
      "msg": "ClickCrate already deactived!"
    },
    {
      "code": 6003,
      "name": "InvalidClickCrateRegistration",
      "msg": "Invalid clickcrate registration"
    },
    {
      "code": 6004,
      "name": "ProductNotFound",
      "msg": "Product Listing was not found"
    },
    {
      "code": 6005,
      "name": "ProductListingExists",
      "msg": "Product Listing has already been registered"
    },
    {
      "code": 6006,
      "name": "ProductListingActivated",
      "msg": "Product Listing already actived!"
    },
    {
      "code": 6007,
      "name": "ProductListingDeactivated",
      "msg": "Product Listing already deactived!"
    },
    {
      "code": 6008,
      "name": "ProductOutOfStock",
      "msg": "The product is out of stock"
    },
    {
      "code": 6009,
      "name": "InvalidProductListingRegistration",
      "msg": "Invalid clickcrate registration"
    },
    {
      "code": 6010,
      "name": "PurchaseFailed",
      "msg": "Purchase did not go through"
    }
  ]
};
