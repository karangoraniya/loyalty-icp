// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Loyalty is Ownable, ReentrancyGuard {
    
    
    // Daily points reward
    uint256 public constant DAILY_POINTS = 50;
    
    struct UserData {
        uint256 points;
        uint256 lastLogin;
        uint256 streak;
    }
    
    // State variables
    mapping(address => UserData) private users;
    
    // Events
    event PointsEarned(address indexed user, uint256 points);
    event StreakUpdated(address indexed user, uint256 streak);
    
    constructor() Ownable(msg.sender) {}
    
    function claimDailyPoints() external nonReentrant {
        UserData storage user = users[msg.sender];
        
        require(
            user.lastLogin == 0 || 
            block.timestamp >= user.lastLogin + 24 hours,
            "Wait 24 hours between claims"
        );
        
        // Update streak
        if (user.lastLogin > 0) {
            if (block.timestamp <= user.lastLogin + 48 hours) {
                user.streak++;
            } else {
                user.streak = 1;
            }
        } else {
            user.streak = 1;
        }
        
        // Update user data
        user.points += DAILY_POINTS;
        user.lastLogin = block.timestamp;
        
        emit PointsEarned(msg.sender, DAILY_POINTS);
        emit StreakUpdated(msg.sender, user.streak);
    }
    
    function getPoints(address user) external view returns (uint256) {
        return users[user].points;
    }
    
    function getStreak(address user) external view returns (uint256) {
        return users[user].streak;
    }
    
    function getUserData(address user) external view returns (UserData memory) {
        return users[user];
    }
}