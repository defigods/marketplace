const curveABI = [
  {
    inputs: [
      {
        internalType: 'contract IBancorFormula',
        name: '_formula',
        type: 'address',
      },
      {
        internalType: 'contract RewardToken',
        name: '_rewardToken',
        type: 'address',
      },
      {
        internalType: 'contract IERC20',
        name: '_dai',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_dao',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_beneficiary',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_batchBlocks',
        type: 'uint256',
      },
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
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'collateral',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'virtualSupply',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'virtualBalance',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint32',
        name: 'reserveRatio',
        type: 'uint32',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'slippage',
        type: 'uint256',
      },
    ],
    name: 'AddCollateralToken',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'collateral',
        type: 'address',
      },
    ],
    name: 'CancelBatch',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'buyer',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'batchId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'collateral',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'ClaimBuyOrder',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'buyer',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'batchId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'collateral',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'ClaimCancelledBuyOrder',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'seller',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'batchId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'collateral',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'ClaimCancelledSellOrder',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'seller',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'batchId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'collateral',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'fee',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'ClaimSellOrder',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'collateral',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'supply',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'balance',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint32',
        name: 'reserveRatio',
        type: 'uint32',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'slippage',
        type: 'uint256',
      },
    ],
    name: 'NewBatch',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'supply',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'buyFeePct',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'sellFeePct',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'formula',
        type: 'address',
      },
    ],
    name: 'NewMetaBatch',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [],
    name: 'Open',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'buyer',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'batchId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'collateral',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'fee',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'OpenBuyOrder',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'seller',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'batchId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'collateral',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'OpenSellOrder',
    type: 'event',
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
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'collateral',
        type: 'address',
      },
    ],
    name: 'RemoveCollateralToken',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'beneficiary',
        type: 'address',
      },
    ],
    name: 'UpdateBeneficiary',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'collateral',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'virtualSupply',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'virtualBalance',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint32',
        name: 'reserveRatio',
        type: 'uint32',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'slippage',
        type: 'uint256',
      },
    ],
    name: 'UpdateCollateralToken',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'buyFeePct',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'sellFeePct',
        type: 'uint256',
      },
    ],
    name: 'UpdateFees',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'formula',
        type: 'address',
      },
    ],
    name: 'UpdateFormula',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'batchId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'collateral',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'totalBuySpend',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'totalBuyReturn',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'totalSellSpend',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'totalSellReturn',
        type: 'uint256',
      },
    ],
    name: 'UpdatePricing',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [],
    name: 'paused',
    type: 'event',
  },
  {
    inputs: [],
    name: 'DAI',
    outputs: [
      {
        internalType: 'contract IERC20',
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
    name: 'PCT_BASE',
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
    name: 'PPM',
    outputs: [
      {
        internalType: 'uint32',
        name: '',
        type: 'uint32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [],
    name: 'batchBlocks',
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
    name: 'beneficiary',
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
    name: 'buyFeePct',
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
        name: '',
        type: 'address',
      },
    ],
    name: 'collaterals',
    outputs: [
      {
        internalType: 'bool',
        name: 'whitelisted',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: 'virtualSupply',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'virtualBalance',
        type: 'uint256',
      },
      {
        internalType: 'uint32',
        name: 'reserveRatio',
        type: 'uint32',
      },
      {
        internalType: 'uint256',
        name: 'slippage',
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
        name: '',
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
  {
    inputs: [],
    name: 'controller',
    outputs: [
      {
        internalType: 'contract IFundraisingController',
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
    name: 'dao',
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
    name: 'formula',
    outputs: [
      {
        internalType: 'contract IBancorFormula',
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
    name: 'isOpen',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'metaBatches',
    outputs: [
      {
        internalType: 'bool',
        name: 'initialized',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: 'realSupply',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'buyFeePct',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'sellFeePct',
        type: 'uint256',
      },
      {
        internalType: 'contract IBancorFormula',
        name: 'formula',
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
    name: 'rewardToken',
    outputs: [
      {
        internalType: 'contract RewardToken',
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
    name: 'sellFeePct',
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
    inputs: [],
    name: 'tokensToBeMinted',
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
        internalType: 'contract IFundraisingController',
        name: '_controller',
        type: 'address',
      },
      {
        internalType: 'contract ITap',
        name: '_tap',
        type: 'address',
      },
    ],
    name: 'setUpMarket',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IBancorFormula',
        name: '_formula',
        type: 'address',
      },
    ],
    name: 'updateFormula',
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
        internalType: 'address',
        name: '_buyer',
        type: 'address',
      },
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
    stateMutability: 'payable',
    type: 'function',
    payable: true,
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_seller',
        type: 'address',
      },
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
    name: 'claimCancelledBuyOrder',
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
    name: 'claimCancelledSellOrder',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getCurrentBatchId',
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
    name: 'getCollateralToken',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'uint32',
        name: '',
        type: 'uint32',
      },
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
    name: 'getBatch',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'uint32',
        name: '',
        type: 'uint32',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
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
        internalType: 'uint256',
        name: '_supply',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_balance',
        type: 'uint256',
      },
      {
        internalType: 'uint32',
        name: '_reserveRatio',
        type: 'uint32',
      },
    ],
    name: 'getStaticPricePPM',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
    constant: true,
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_collateralToken',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
    ],
    name: 'transfer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]
module.exports = curveABI
