document.addEventListener('DOMContentLoaded', function() {
    // Mock club data
    const clubsData = [
        {
            domain: 'community1',
            name: 'Community1 Club',
            description: 'A community-driven club focused on blockchain technology discussions.',
            logo: 'https://placehold.co/200x200?text=C1',
            banner: 'https://placehold.co/1200x300?text=Community1',
            memberCount: 350,
            creationDate: '2023-05-10',
            admin: '0x1234567890abcdef1234567890abcdef12345678',
            permanentPrice: 0.05,
            monthlyPrice: 0.01,
            quarterlyPrice: 0.025,
            yearlyPrice: 0.08,
            hasTokenGate: true,
            tokenAddress: '0x2345678901abcdef2345678901abcdef23456789',
            tokenSymbol: 'COMM',
            tokenThreshold: 100,
            hasNftGate: false,
            nftAddress: '',
            nftThreshold: 0
        },
        {
            domain: 'gaming',
            name: 'Gaming Club',
            description: 'A Web3 club for gamers, exploring GameFi and NFT games.',
            logo: 'https://placehold.co/200x200?text=G',
            banner: 'https://placehold.co/1200x300?text=Gaming',
            memberCount: 780,
            creationDate: '2023-04-15',
            admin: '0x2345678901abcdef2345678901abcdef23456789',
            permanentPrice: 0.08,
            monthlyPrice: 0.015,
            quarterlyPrice: 0.04,
            yearlyPrice: 0.12,
            hasTokenGate: false,
            tokenAddress: '',
            tokenSymbol: '',
            tokenThreshold: 0,
            hasNftGate: true,
            nftAddress: '0x3456789012abcdef3456789012abcdef34567890',
            nftThreshold: 1
        },
        {
            domain: 'defi',
            name: 'DeFi Research Club',
            description: 'Professional club focused on DeFi research and project analysis.',
            logo: 'https://placehold.co/200x200?text=DeFi',
            banner: 'https://placehold.co/1200x300?text=DeFi',
            memberCount: 560,
            creationDate: '2023-03-20',
            admin: '0x3456789012abcdef3456789012abcdef34567890',
            permanentPrice: 0.1,
            monthlyPrice: 0.02,
            quarterlyPrice: 0.05,
            yearlyPrice: 0.15,
            hasTokenGate: true,
            tokenAddress: '0x4567890123abcdef4567890123abcdef45678901',
            tokenSymbol: 'DEFI',
            tokenThreshold: 50,
            hasNftGate: false,
            nftAddress: '',
            nftThreshold: 0
        },
        {
            domain: 'nft',
            name: 'NFT Collectors Club',
            description: 'A club designed for NFT collectors, sharing NFT news and investment opportunities.',
            logo: 'https://placehold.co/200x200?text=NFT',
            banner: 'https://placehold.co/1200x300?text=NFT',
            memberCount: 420,
            creationDate: '2023-02-10',
            admin: '0x4567890123abcdef4567890123abcdef45678901',
            permanentPrice: 0.07,
            monthlyPrice: 0.012,
            quarterlyPrice: 0.03,
            yearlyPrice: 0.09,
            hasTokenGate: false,
            tokenAddress: '',
            tokenSymbol: '',
            tokenThreshold: 0,
            hasNftGate: true,
            nftAddress: '0x5678901234abcdef5678901234abcdef56789012',
            nftThreshold: 1
        },
        {
            domain: 'dao',
            name: 'Web3 DAO Club',
            description: 'Bringing together users interested in DAOs to discuss governance and operational models.',
            logo: 'https://placehold.co/200x200?text=DAO',
            banner: 'https://placehold.co/1200x300?text=DAO',
            memberCount: 320,
            creationDate: '2023-01-05',
            admin: '0x5678901234abcdef5678901234abcdef56789012',
            permanentPrice: 0.06,
            monthlyPrice: 0.01,
            quarterlyPrice: 0.025,
            yearlyPrice: 0.08,
            hasTokenGate: true,
            tokenAddress: '0x6789012345abcdef6789012345abcdef67890123',
            tokenSymbol: 'DAO',
            tokenThreshold: 20,
            hasNftGate: false,
            nftAddress: '',
            nftThreshold: 0
        }
    ];
    
    // Current filter and pagination state
    let currentFilter = {
        search: '',
        type: 'all',
        membershipType: 'all'
    };
    
    let currentPage = 1;
    const itemsPerPage = 6;
    
    // Initialize
    loadClubs();
    setupEventListeners();
    
    // Check URL parameters for specific club details
    checkUrlForClubDetails();
    
    // Load club list
    function loadClubs() {
        const filteredClubs = filterClubs();
        const paginatedClubs = paginateClubs(filteredClubs);
        
        renderClubs(paginatedClubs);
        
        // Show/hide "Load More" button
        const loadMoreContainer = document.getElementById('loadMoreContainer');
        if (currentPage * itemsPerPage >= filteredClubs.length) {
            loadMoreContainer.classList.add('d-none');
        } else {
            loadMoreContainer.classList.remove('d-none');
        }
        
        // Show/hide "No clubs found" message
        const noClubsFound = document.getElementById('noClubsFound');
        if (filteredClubs.length === 0) {
            noClubsFound.classList.remove('d-none');
        } else {
            noClubsFound.classList.add('d-none');
        }
    }
    
    // Filter clubs
    function filterClubs() {
        return clubsData.filter(club => {
            // Search condition
            if (currentFilter.search && 
                !club.name.toLowerCase().includes(currentFilter.search.toLowerCase()) && 
                !club.domain.toLowerCase().includes(currentFilter.search.toLowerCase()) &&
                !club.description.toLowerCase().includes(currentFilter.search.toLowerCase())) {
                return false;
            }
            
            // Type condition
            if (currentFilter.type === 'memberCount') {
                // Add member count sorting logic here
            } else if (currentFilter.type === 'newest') {
                // Add newest creation sorting logic here
            } else if (currentFilter.type === 'popular') {
                // Add most popular sorting logic here
            }
            
            // Membership type condition
            if (currentFilter.membershipType === 'permanent') {
                if (club.permanentPrice <= 0) return false;
            } else if (currentFilter.membershipType === 'temporary') {
                if (club.monthlyPrice <= 0) return false;
            } else if (currentFilter.membershipType === 'token') {
                if (!club.hasTokenGate && !club.hasNftGate) return false;
            }
            
            return true;
        });
    }
    
    // Paginate filtered clubs
    function paginateClubs(clubs) {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return clubs.slice(startIndex, endIndex);
    }
    
    // Render club list
    function renderClubs(clubs) {
        const clubsList = document.getElementById('clubsList');
        
        // Clear list if first page
        if (currentPage === 1) {
            clubsList.innerHTML = '';
        }
        
        clubs.forEach(club => {
            const card = document.createElement('div');
            card.className = 'col-md-4 mb-4';
            card.innerHTML = `
                <div class="card h-100">
                    <div class="card-header bg-light">
                        <h5 class="card-title mb-0">${club.name}</h5>
                    </div>
                    <div class="card-body">
                        <div class="d-flex mb-3">
                            <img src="${club.logo}" alt="${club.name}" class="rounded me-3" style="width: 64px; height: 64px;">
                            <div>
                                <p class="card-text">${club.domain}.web3.club</p>
                                <p class="card-text"><small class="text-muted">Members: ${club.memberCount}</small></p>
                            </div>
                        </div>
                        <p class="card-text">${club.description}</p>
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-primary w-100 viewClubDetails" data-domain="${club.domain}">
                            View Details
                        </button>
                    </div>
                </div>
            `;
            clubsList.appendChild(card);
        });
        
        // Add view details button event
        document.querySelectorAll('.viewClubDetails').forEach(btn => {
            btn.addEventListener('click', function() {
                const domain = this.getAttribute('data-domain');
                showClubDetails(domain);
            });
        });
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Search button
        document.getElementById('searchButton').addEventListener('click', function() {
            currentFilter.search = document.getElementById('searchClub').value.trim();
            currentPage = 1;
            loadClubs();
        });
        
        // Search input enter key
        document.getElementById('searchClub').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                currentFilter.search = this.value.trim();
                currentPage = 1;
                loadClubs();
            }
        });
        
        // Filter type
        document.getElementById('filterType').addEventListener('change', function() {
            currentFilter.type = this.value;
            currentPage = 1;
            loadClubs();
        });
        
        // Membership type
        document.getElementById('membershipType').addEventListener('change', function() {
            currentFilter.membershipType = this.value;
            currentPage = 1;
            loadClubs();
        });
        
        // Load more button
        document.getElementById('loadMoreBtn').addEventListener('click', function() {
            currentPage++;
            loadClubs();
        });
        
        // Reset filters
        document.getElementById('resetFiltersBtn').addEventListener('click', function() {
            document.getElementById('searchClub').value = '';
            document.getElementById('filterType').value = 'all';
            document.getElementById('membershipType').value = 'all';
            
            currentFilter = {
                search: '',
                type: 'all',
                membershipType: 'all'
            };
            
            currentPage = 1;
            loadClubs();
        });
        
        // Buy buttons in club details modal
        document.getElementById('buyPermanentBtn').addEventListener('click', function() {
            const clubName = document.getElementById('clubName').textContent;
            const price = document.getElementById('permanentMembershipPrice').textContent.split(':')[1].trim();
            
            document.getElementById('confirmClubName').textContent = clubName;
            document.getElementById('confirmMembershipType').textContent = 'Permanent';
            document.getElementById('confirmPrice').textContent = price;
            
            const purchaseModal = new bootstrap.Modal(document.getElementById('purchaseConfirmModal'));
            purchaseModal.show();
        });
        
        document.getElementById('buyMonthlyBtn').addEventListener('click', function() {
            const clubName = document.getElementById('clubName').textContent;
            const price = document.getElementById('monthlyPrice').textContent;
            
            document.getElementById('confirmClubName').textContent = clubName;
            document.getElementById('confirmMembershipType').textContent = 'Monthly';
            document.getElementById('confirmPrice').textContent = price;
            
            const purchaseModal = new bootstrap.Modal(document.getElementById('purchaseConfirmModal'));
            purchaseModal.show();
        });
        
        document.getElementById('buyQuarterlyBtn').addEventListener('click', function() {
            const clubName = document.getElementById('clubName').textContent;
            const price = document.getElementById('quarterlyPrice').textContent;
            
            document.getElementById('confirmClubName').textContent = clubName;
            document.getElementById('confirmMembershipType').textContent = 'Quarterly';
            document.getElementById('confirmPrice').textContent = price;
            
            const purchaseModal = new bootstrap.Modal(document.getElementById('purchaseConfirmModal'));
            purchaseModal.show();
        });
        
        document.getElementById('buyYearlyBtn').addEventListener('click', function() {
            const clubName = document.getElementById('clubName').textContent;
            const price = document.getElementById('yearlyPrice').textContent;
            
            document.getElementById('confirmClubName').textContent = clubName;
            document.getElementById('confirmMembershipType').textContent = 'Yearly';
            document.getElementById('confirmPrice').textContent = price;
            
            const purchaseModal = new bootstrap.Modal(document.getElementById('purchaseConfirmModal'));
            purchaseModal.show();
        });
        
        // Confirm purchase
        document.getElementById('confirmPurchaseBtn').addEventListener('click', function() {
            const membershipType = document.getElementById('confirmMembershipType').textContent;
            
            showNotification(`Purchasing ${membershipType} membership...`, 'info');
            
            // Close modal
            const purchaseModal = bootstrap.Modal.getInstance(document.getElementById('purchaseConfirmModal'));
            purchaseModal.hide();
            
            // Simulate blockchain transaction
            setTimeout(() => {
                if (mockData.wallet.connected) {
                    showNotification(`${membershipType} membership purchased successfully!`, 'success');
                } else {
                    showNotification('Please connect your wallet before purchasing membership', 'warning');
                }
            }, 2000);
        });
        
        // Check token access
        document.getElementById('checkTokenAccessBtn').addEventListener('click', function() {
            if (!mockData.wallet.connected) {
                showNotification('Please connect your wallet before checking membership eligibility', 'warning');
                return;
            }
            
            showNotification('Checking token membership eligibility...', 'info');
            
            // Simulate check
            setTimeout(() => {
                const random = Math.random();
                if (random > 0.5) {
                    showNotification('Congratulations! You hold enough tokens to qualify for membership', 'success');
                } else {
                    showNotification('Sorry, you do not hold enough tokens to qualify for membership', 'danger');
                }
            }, 1500);
        });
    }
    
    // Show club details
    function showClubDetails(domain) {
        const club = clubsData.find(c => c.domain === domain);
        if (!club) return;
        
        // Fill modal data
        document.getElementById('clubBannerContainer').style.backgroundImage = `url('${club.banner}')`;
        document.getElementById('clubLogo').src = club.logo;
        document.getElementById('clubName').textContent = club.name;
        document.getElementById('clubDomain').textContent = `${club.domain}.web3.club`;
        document.getElementById('clubDescription').textContent = club.description;
        document.getElementById('clubMemberCount').textContent = club.memberCount;
        document.getElementById('clubCreationDate').textContent = club.creationDate;
        document.getElementById('clubAdmin').textContent = shortenAddress(club.admin);
        
        document.getElementById('permanentMembershipPrice').textContent = `Price: ${club.permanentPrice} ETH`;
        document.getElementById('monthlyPrice').textContent = `${club.monthlyPrice} ETH`;
        document.getElementById('quarterlyPrice').textContent = `${club.quarterlyPrice} ETH`;
        document.getElementById('yearlyPrice').textContent = `${club.yearlyPrice} ETH`;
        
        // Token gate area
        const tokenGateContainer = document.getElementById('tokenGateContainer');
        const tokenRequirementsList = document.getElementById('tokenRequirementsList');
        
        if (club.hasTokenGate || club.hasNftGate) {
            tokenGateContainer.classList.remove('d-none');
            
            // Clear old requirements list
            tokenRequirementsList.innerHTML = '';
            
            // Add ERC20 token requirement (if any)
            if (club.hasTokenGate) {
                const erc20Item = document.createElement('div');
                erc20Item.className = 'list-group-item list-group-item-action';
                erc20Item.innerHTML = `
                    <div class="d-flex w-100 justify-content-between align-items-center">
                        <h6 class="mb-1"><i class="bi bi-coin me-2"></i>ERC20 Token</h6>
                        <span class="badge bg-primary">Token</span>
                    </div>
                    <p class="mb-1">Hold <span class="fw-bold">${club.tokenThreshold}</span> <span class="fw-bold">${club.tokenSymbol}</span> tokens</p>
                    <small class="text-muted">Token Contract: ${shortenAddress(club.tokenAddress)}</small>
                `;
                tokenRequirementsList.appendChild(erc20Item);
            }
            
            // Add NFT requirement (if any)
            if (club.hasNftGate) {
                const nftItem = document.createElement('div');
                nftItem.className = 'list-group-item list-group-item-action';
                nftItem.innerHTML = `
                    <div class="d-flex w-100 justify-content-between align-items-center">
                        <h6 class="mb-1"><i class="bi bi-image me-2"></i>NFT Holding</h6>
                        <span class="badge bg-info">NFT</span>
                    </div>
                    <p class="mb-1">Hold at least <span class="fw-bold">${club.nftThreshold}</span> specified NFTs</p>
                    <small class="text-muted">NFT Contract: ${shortenAddress(club.nftAddress)}</small>
                `;
                tokenRequirementsList.appendChild(nftItem);
            }
            
            // Add example cross-chain token requirement (for specific clubs)
            if (club.domain === 'community1') {
                const crossChainItem = document.createElement('div');
                crossChainItem.className = 'list-group-item list-group-item-action';
                crossChainItem.innerHTML = `
                    <div class="d-flex w-100 justify-content-between align-items-center">
                        <h6 class="mb-1"><i class="bi bi-link-45deg me-2"></i>Cross-chain Token</h6>
                        <span class="badge bg-warning text-dark">Polygon</span>
                    </div>
                    <p class="mb-1">Hold <span class="fw-bold">50</span> <span class="fw-bold">MATIC</span> on Polygon</p>
                    <small class="text-muted">Token Contract: 0x9876...5432</small>
                `;
                tokenRequirementsList.appendChild(crossChainItem);
            }
            
            // Add example multi-chain NFT requirement (for specific clubs)
            if (club.domain === 'nft') {
                const multiChainNftItem = document.createElement('div');
                multiChainNftItem.className = 'list-group-item list-group-item-action';
                multiChainNftItem.innerHTML = `
                    <div class="d-flex w-100 justify-content-between align-items-center">
                        <h6 class="mb-1"><i class="bi bi-boxes me-2"></i>Multi-chain NFT Holding</h6>
                        <span class="badge bg-success">BSC</span>
                    </div>
                    <p class="mb-1">Hold specific collection NFT on BSC</p>
                    <small class="text-muted">Collection Address: 0xabcd...efgh</small>
                `;
                tokenRequirementsList.appendChild(multiChainNftItem);
            }
        } else {
            tokenGateContainer.classList.add('d-none');
        }
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('clubDetailsModal'));
        modal.show();
    }
    
    // Check URL parameters for specific club details
    function checkUrlForClubDetails() {
        const urlParams = new URLSearchParams(window.location.search);
        const clubDomain = urlParams.get('club');
        
        if (clubDomain) {
            // Try to find matching club
            const club = clubsData.find(c => c.domain === clubDomain);
            if (club) {
                // If found, show details
                setTimeout(() => {
                    showClubDetails(clubDomain);
                }, 500);
            }
        }
    }
    
    // Shorten address display
    function shortenAddress(address) {
        return address.substring(0, 6) + '...' + address.substring(address.length - 4);
    }
    
    // Notification function
    function showNotification(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type} border-0`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        
        const toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            const container = document.createElement('div');
            container.className = 'toast-container position-fixed top-0 end-0 p-3';
            document.body.appendChild(container);
            container.appendChild(toast);
        } else {
            toastContainer.appendChild(toast);
        }
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
    }
}); 