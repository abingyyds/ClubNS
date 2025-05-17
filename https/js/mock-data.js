// 模拟数据
const mockData = {
    // 钱包信息
    wallet: {
        connected: true,
        address: '0x1234567890123456789012345678901234567890'
    },
    
    // 合约设置
    settings: {
        baseYearlyFee: 0.01,
        depositAmount: 0.05,
        lateRenewalPenalty: 10
    },
    
    // 合约余额
    contractBalance: '1.5 ETH',
    
    // 域名列表
    domains: [
        {
            name: 'example',
            fullName: 'example.web3.club',
            owner: '0x1234567890123456789012345678901234567890',
            registrationTime: '2023-06-01T00:00:00Z',
            expiryTime: '2024-06-01T00:00:00Z',  // Reclaiming Period 状态
            tokenId: '2',
            autoRenewalFunds: '0'
        },
        {
            name: 'test',
            fullName: 'test.web3.club',
            owner: '0x1234567890123456789012345678901234567890',
            registrationTime: '2023-05-15T00:00:00Z',
            expiryTime: '2024-05-15T00:00:00Z',  // Reclaiming Period 状态
            tokenId: '3',
            autoRenewalFunds: '0'
        },
        {
            name: 'demo',
            fullName: 'demo.web3.club',
            owner: '0x1234567890123456789012345678901234567890',
            registrationTime: '2023-04-10T00:00:00Z',
            expiryTime: '2025-04-10T00:00:00Z',  // 设置为未来日期，但显示为 Expired 状态
            tokenId: '1',
            autoRenewalFunds: '0'
        },
        {
            name: 'crypto',
            fullName: 'crypto.web3.club',
            owner: '0x1234567890123456789012345678901234567890',
            registrationTime: '2023-12-15T00:00:00Z',
            expiryTime: '2024-03-20T00:00:00Z',  // Expiring Soon 状态
            tokenId: '4',
            autoRenewalFunds: '0'
        },
        {
            name: 'nft',
            fullName: 'nft.web3.club',
            owner: '0x1234567890123456789012345678901234567890',
            registrationTime: '2023-01-01T00:00:00Z',
            expiryTime: '2024-02-15T00:00:00Z',  // Grace Period 状态
            tokenId: '5',
            autoRenewalFunds: '0.02'
        },
        {
            name: 'defi',
            fullName: 'defi.web3.club',
            owner: '0x1234567890123456789012345678901234567890',
            registrationTime: '2022-11-01T00:00:00Z',
            expiryTime: '2024-01-20T00:00:00Z',  // Expired 状态
            tokenId: '6',
            autoRenewalFunds: '0'
        },
        {
            name: 'dao',
            fullName: 'dao.web3.club',
            owner: '0x1234567890123456789012345678901234567890',
            registrationTime: '2022-10-01T00:00:00Z',
            expiryTime: '2024-01-05T00:00:00Z',  // Frozen 状态
            tokenId: '7',
            autoRenewalFunds: '0'
        },
        {
            name: 'active1',
            fullName: 'active1.web3.club',
            owner: '0x1234567890123456789012345678901234567890',
            registrationTime: '2023-05-01T00:00:00Z',
            expiryTime: '2025-05-01T00:00:00Z',  // Active 状态
            tokenId: '8',
            autoRenewalFunds: '0.05'
        },
        {
            name: 'active2',
            fullName: 'active2.web3.club',
            owner: '0x1234567890123456789012345678901234567890',
            registrationTime: '2023-06-15T00:00:00Z',
            expiryTime: '2025-06-15T00:00:00Z',  // Active 状态
            tokenId: '9',
            autoRenewalFunds: '0.03'
        }
    ],

    // 交易记录
    transactions: [
        {
            type: 'register',
            amount: 0.01,
            date: '2023-06-25T11:15:00Z',
            status: 'success'
        },
        {
            type: 'renew',
            amount: 0.02,
            date: '2023-06-26T09:30:00Z',
            status: 'success'
        }
    ]
}; 