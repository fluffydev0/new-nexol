// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title NexolPayVault
 * @notice ERC4626 vault for USDC on Base with fixed-term yield locks
 * @dev 6-month lock = 4.2% APY, 12-month lock = 6.1% APY
 */
contract NexolPayVault is ERC4626, Ownable, ReentrancyGuard {

    // --- Constants ---
    uint256 public constant APY_6_MONTH = 420;   // 4.20% in basis points
    uint256 public constant APY_12_MONTH = 610;  // 6.10% in basis points
    uint256 public constant BASIS_POINTS = 10_000;
    uint256 public constant SIX_MONTHS = 180 days;
    uint256 public constant TWELVE_MONTHS = 365 days;

    enum LockDuration { SixMonths, TwelveMonths }

    struct VaultDeposit {
        uint256 amount;
        uint256 lockedAt;
        uint256 unlockAt;
        LockDuration duration;
        bool withdrawn;
    }

    mapping(address => VaultDeposit[]) public deposits;

    // --- Events ---
    event Locked(address indexed user, uint256 amount, LockDuration duration, uint256 unlockAt);
    event Unlocked(address indexed user, uint256 depositIndex, uint256 principal, uint256 yield_);

    constructor(
        IERC20 _usdc
    )
        ERC20("NexolPay Vault Share", "nxVLT")
        ERC4626(_usdc)
        Ownable(msg.sender)
    {}

    // --- Core ---

    /**
     * @notice Lock USDC for a fixed term
     * @param amount USDC amount (6 decimals)
     * @param duration 0 = 6 months, 1 = 12 months
     */
    function lockDeposit(uint256 amount, LockDuration duration) external nonReentrant {
        require(amount > 0, "Amount must be > 0");

        uint256 lockPeriod = duration == LockDuration.SixMonths ? SIX_MONTHS : TWELVE_MONTHS;

        // Transfer USDC into vault
        IERC20(asset()).transferFrom(msg.sender, address(this), amount);

        deposits[msg.sender].push(VaultDeposit({
            amount: amount,
            lockedAt: block.timestamp,
            unlockAt: block.timestamp + lockPeriod,
            duration: duration,
            withdrawn: false
        }));

        emit Locked(msg.sender, amount, duration, block.timestamp + lockPeriod);
    }

    /**
     * @notice Withdraw principal + yield after lock expires
     */
    function unlockDeposit(uint256 index) external nonReentrant {
        require(index < deposits[msg.sender].length, "Invalid index");

        VaultDeposit storage dep = deposits[msg.sender][index];
        require(!dep.withdrawn, "Already withdrawn");
        require(block.timestamp >= dep.unlockAt, "Still locked");

        dep.withdrawn = true;

        uint256 yield_ = calculateYield(dep.amount, dep.duration);
        uint256 total = dep.amount + yield_;

        IERC20(asset()).transfer(msg.sender, total);

        emit Unlocked(msg.sender, index, dep.amount, yield_);
    }

    // --- View ---

    function calculateYield(uint256 amount, LockDuration duration) public pure returns (uint256) {
        uint256 apy = duration == LockDuration.SixMonths ? APY_6_MONTH : APY_12_MONTH;
        uint256 lockDays = duration == LockDuration.SixMonths ? 180 : 365;
        return (amount * apy * lockDays) / (BASIS_POINTS * 365);
    }

    function getDeposits(address user) external view returns (VaultDeposit[] memory) {
        return deposits[user];
    }

    function getDepositCount(address user) external view returns (uint256) {
        return deposits[user].length;
    }

    /**
     * @notice Owner can inject yield reserves into vault
     */
    function fundYieldReserve(uint256 amount) external onlyOwner {
        IERC20(asset()).transferFrom(msg.sender, address(this), amount);
    }
}
