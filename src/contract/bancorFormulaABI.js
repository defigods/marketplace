const bancorFormulaABI = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'version',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
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
        name: '_connectorBalance',
        type: 'uint256',
      },
      {
        internalType: 'uint32',
        name: '_connectorWeight',
        type: 'uint32',
      },
      {
        internalType: 'uint256',
        name: '_depositAmount',
        type: 'uint256',
      },
    ],
    name: 'calculatePurchaseReturn',
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
        internalType: 'uint256',
        name: '_supply',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_connectorBalance',
        type: 'uint256',
      },
      {
        internalType: 'uint32',
        name: '_connectorWeight',
        type: 'uint32',
      },
      {
        internalType: 'uint256',
        name: '_sellAmount',
        type: 'uint256',
      },
    ],
    name: 'calculateSaleReturn',
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
        internalType: 'uint256',
        name: '_fromConnectorBalance',
        type: 'uint256',
      },
      {
        internalType: 'uint32',
        name: '_fromConnectorWeight',
        type: 'uint32',
      },
      {
        internalType: 'uint256',
        name: '_toConnectorBalance',
        type: 'uint256',
      },
      {
        internalType: 'uint32',
        name: '_toConnectorWeight',
        type: 'uint32',
      },
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
    ],
    name: 'calculateCrossConnectorReturn',
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
module.exports = bancorFormulaABI
