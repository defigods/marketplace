const controllerABI = [
  {
    inputs: [
      {
        internalType: 'contract BatchedBancorMarketMaker',
        name: '_marketMaker',
        type: 'address',
      },
      {
        internalType: 'contract ITap',
        name: '_tap',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    inputs: [],
    name: 'TO_RESET_CAP',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [],
    name: 'marketMaker',
    outputs: [
      {
        internalType: 'contract BatchedBancorMarketMaker',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'tap',
    outputs: [
      {
        internalType: 'contract ITap',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_beneficiary',
        type: 'address',
      },
    ],
    name: 'updateBeneficiary',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_buyFeePct',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_sellFeePct',
        type: 'uint256',
      },
    ],
    name: 'updateFees',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_collateral',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'openBuyOrder',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_collateral',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
    ],
    name: 'openSellOrder',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_buyer',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_batchId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_collateral',
        type: 'address',
      },
    ],
    name: 'claimBuyOrder',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_seller',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_batchId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_collateral',
        type: 'address',
      },
    ],
    name: 'claimSellOrder',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_collateral',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_virtualSupply',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_virtualBalance',
        type: 'uint256',
      },
      {
        internalType: 'uint32',
        name: '_reserveRatio',
        type: 'uint32',
      },
      {
        internalType: 'uint256',
        name: '_slippage',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_rate',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_floor',
        type: 'uint256',
      },
    ],
    name: 'addCollateralToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_collateral',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_virtualSupply',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_virtualBalance',
        type: 'uint256',
      },
      {
        internalType: 'uint32',
        name: '_reserveRatio',
        type: 'uint32',
      },
      {
        internalType: 'uint256',
        name: '_slippage',
        type: 'uint256',
      },
    ],
    name: 'reAddCollateralToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_collateral',
        type: 'address',
      },
    ],
    name: 'removeCollateralToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_collateral',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_virtualSupply',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_virtualBalance',
        type: 'uint256',
      },
      {
        internalType: 'uint32',
        name: '_reserveRatio',
        type: 'uint32',
      },
      {
        internalType: 'uint256',
        name: '_slippage',
        type: 'uint256',
      },
    ],
    name: 'updateCollateralToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_maximumTapRateIncreasePct',
        type: 'uint256',
      },
    ],
    name: 'updateMaximumTapRateIncreasePct',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_maximumTapFloorDecreasePct',
        type: 'uint256',
      },
    ],
    name: 'updateMaximumTapFloorDecreasePct',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_token',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_rate',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_floor',
        type: 'uint256',
      },
    ],
    name: 'addTokenTap',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_token',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_rate',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_floor',
        type: 'uint256',
      },
    ],
    name: 'updateTokenTap',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_token',
        type: 'address',
      },
    ],
    name: 'updateTappedAmount',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'token',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_token',
        type: 'address',
      },
    ],
    name: 'getMaximumWithdrawal',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_collateral',
        type: 'address',
      },
    ],
    name: 'collateralsToBeClaimed',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
]
module.exports = controllerABI
