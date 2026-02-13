# Crypto Trading Platform - Questions & Answers

## Technical Interview Questions

### React & Frontend

**Q1: How does the portfolio state management work in this application?**
- The portfolio uses React Context API (`PortfolioContext`) to manage global state
- State includes cash balance, positions, and transaction history
- Data persists to localStorage for data retention across sessions
- Updates trigger re-renders only for components that consume the context

**Q2: Why was Canvas used for the chart instead of a library like Chart.js?**
- Custom Canvas implementation provides full control over rendering
- Better performance for real-time updates and animations
- Lighter bundle size compared to chart libraries
- Demonstrates low-level understanding of graphics rendering

**Q3: How does the application handle API rate limiting from CoinGecko?**
- Currently fetches data at component mount and on user interaction
- Could be improved with caching, request debouncing, or upgrading to paid API
- Uses Axios for HTTP requests with error handling

**Q4: Explain the trading logic validation in the Buy/Sell functions**
- Buy: Validates sufficient cash balance (cash >= quantity * currentPrice)
- Sell: Validates sufficient position quantity and that position exists
- Updates both cash balance and positions atomically
- Records all transactions with timestamps for audit trail

**Q5: How is the P&L (Profit & Loss) calculated?**
```
P&L = (Current Price - Average Cost) × Quantity
P&L % = ((Current Price - Average Cost) / Average Cost) × 100
```
- Tracks average cost per crypto across multiple purchases
- Real-time updates as prices change
- Color-coded: green for profit, red for loss

### TypeScript Questions

**Q6: What TypeScript types are used in this project?**
```typescript
- Crypto: Represents cryptocurrency data (id, symbol, name, price, etc.)
- Position: User holdings (crypto, quantity, averageCost)
- Transaction: Trade history (type, crypto, quantity, price, timestamp)
- TimeFrame: Chart time periods ('24h' | '7d' | '30d' | '90d')
```

**Q7: Why use TypeScript over JavaScript?**
- Type safety prevents runtime errors
- Better IDE autocomplete and refactoring
- Self-documenting code with interfaces
- Catches bugs during development, not production

### Architecture Questions

**Q8: Describe the component architecture**
```
App (Main Container)
├── CryptoList (Left Sidebar)
│   └── Displays top 20 cryptos with prices
├── Chart (Center Panel)
│   └── Canvas-based price visualization
└── Portfolio (Right Sidebar)
    ├── Balance Display
    ├── Trading Interface (Buy/Sell)
    ├── Positions List
    └── Transaction History
```

**Q9: How would you scale this application?**
- Add WebSocket connections for real-time price updates
- Implement backend API for user authentication and data persistence
- Add database (PostgreSQL/MongoDB) to store user data
- Implement caching layer (Redis) for API responses
- Use state management library (Redux/Zustand) for complex state
- Add pagination for transaction history
- Implement virtual scrolling for large lists

**Q10: What security considerations should be addressed?**
- Input validation and sanitization
- API key management (move to backend)
- Rate limiting on trading actions
- HTTPS enforcement in production
- Content Security Policy headers
- XSS protection through React's built-in escaping

## Testing Questions

### Manual Testing Checklist

**Q11: How would you test the trading functionality?**
- [ ] Can buy crypto with sufficient balance
- [ ] Cannot buy with insufficient balance
- [ ] Can sell crypto with sufficient position
- [ ] Cannot sell non-existent position
- [ ] Cannot sell more than owned quantity
- [ ] P&L updates correctly after trades
- [ ] Transaction history records all trades
- [ ] Portfolio persists after page refresh
- [ ] Average cost calculates correctly for multiple purchases
- [ ] Price updates reflect in portfolio value

**Q12: What edge cases should be tested?**
- Trading with decimal quantities
- Trading at price extremes (very high/low)
- Rapid consecutive trades
- Browser localStorage limits
- API failures and timeout handling
- Invalid crypto selection
- Network offline scenarios
- Browser compatibility (Chrome, Firefox, Safari)

### Unit Test Examples

**Q13: What unit tests would you write?**
```typescript
// Portfolio calculations
- calculateTotalValue()
- calculatePnL()
- updatePosition()

// Trading validation
- canBuy()
- canSell()
- validateTradeAmount()

// Data formatting
- formatCurrency()
- formatPercentage()
- formatTimestamp()
```

## Feature Enhancement Questions

**Q14: What features would you add next?**

**Priority 1 - Essential:**
- User authentication and accounts
- Backend API for data persistence
- Real-time price updates via WebSocket
- Stop-loss and take-profit orders
- Price alerts/notifications

**Priority 2 - Important:**
- Advanced charting (indicators, drawing tools)
- Order history filtering and search
- Export transaction history (CSV/PDF)
- Multi-currency support (USD, EUR, BTC)
- Mobile responsive improvements

**Priority 3 - Nice to Have:**
- Paper trading mode (practice with fake money)
- Social features (share trades, leaderboard)
- Technical analysis indicators (RSI, MACD, Bollinger Bands)
- News feed integration
- Portfolio analytics dashboard
- Tax reporting tools

**Q15: How would you implement real-time price updates?**
```typescript
// WebSocket approach
const ws = new WebSocket('wss://api.example.com/crypto-prices');

ws.onmessage = (event) => {
  const priceUpdate = JSON.parse(event.data);
  updateCryptoPrice(priceUpdate.symbol, priceUpdate.price);
};

// Alternative: Polling with setInterval
useEffect(() => {
  const interval = setInterval(() => {
    fetchLatestPrices();
  }, 30000); // Every 30 seconds
  
  return () => clearInterval(interval);
}, []);
```

**Q16: How would you add user authentication?**
- Implement JWT-based authentication
- Add login/register pages
- Store tokens in httpOnly cookies
- Protected routes with React Router
- Backend middleware for token verification
- Password hashing with bcrypt
- Email verification flow

## Performance Questions

**Q17: How would you optimize the chart rendering?**
- Use requestAnimationFrame for smooth animations
- Implement canvas double buffering
- Throttle window resize events
- Use Web Workers for heavy calculations
- Cache rendered chart segments
- Implement lazy loading for historical data

**Q18: How would you optimize the React components?**
- Use React.memo for expensive components
- Implement useMemo for complex calculations
- Use useCallback for function props
- Code splitting with React.lazy
- Virtualize long lists (react-window)
- Debounce search and filter inputs

**Q19: What would you measure for performance?**
- Initial page load time (Lighthouse score)
- Time to interactive (TTI)
- First contentful paint (FCP)
- Chart rendering FPS
- API response times
- Bundle size and code splitting efficiency
- Memory usage and leak detection

## System Design Questions

**Q20: Design a scalable trading platform backend**

```
Components:
1. API Gateway (Load Balancer)
2. Authentication Service
3. Trading Service (Place/Cancel orders)
4. Portfolio Service (Holdings, P&L)
5. Market Data Service (Price feeds)
6. Notification Service (Alerts, emails)
7. Database Cluster (PostgreSQL with read replicas)
8. Cache Layer (Redis)
9. Message Queue (RabbitMQ/Kafka)
10. WebSocket Server (Real-time updates)

Data Flow:
User → API Gateway → Auth Service → Trading Service
                                   ↓
Trading Service → Message Queue → Order Processor
                                   ↓
Order Processor → Database → Cache Update
                            ↓
WebSocket Server → Push updates to clients
```

**Q21: How would you handle high-frequency trading?**
- In-memory order matching engine
- Event sourcing for transaction log
- CQRS pattern (Command Query Responsibility Segregation)
- Distributed caching
- Database connection pooling
- Async processing with message queues
- Horizontal scaling with load balancers

## Code Review Questions

**Q22: What improvements would you suggest for the codebase?**

**Code Quality:**
- Add comprehensive error boundaries
- Implement proper loading states
- Add form validation with error messages
- Use custom hooks for reusable logic
- Add PropTypes or stricter TypeScript types
- Implement better error handling patterns

**Project Structure:**
- Separate API calls into service layer
- Create utils folder for helper functions
- Add constants file for magic numbers
- Implement proper environment variables
- Add comprehensive component documentation

**Testing:**
- Add unit tests with Vitest
- Add integration tests
- Add E2E tests with Playwright
- Implement CI/CD pipeline
- Add test coverage requirements

## Behavioral Questions

**Q23: How would you approach debugging a production issue?**
1. Gather information (error logs, user reports, reproduction steps)
2. Check monitoring/logging systems (Sentry, DataDog)
3. Reproduce the issue locally
4. Isolate the root cause
5. Implement fix with tests
6. Deploy with rollback plan
7. Monitor post-deployment
8. Document the issue and resolution

**Q24: How do you stay updated with frontend technologies?**
- Follow industry blogs (CSS-Tricks, Smashing Magazine)
- Subscribe to newsletters (JavaScript Weekly, React Status)
- Participate in communities (Reddit, Dev.to, Twitter)
- Attend conferences and meetups
- Read documentation and RFCs
- Build side projects to experiment
- Contribute to open source

**Q25: Describe your development workflow**
1. Understand requirements thoroughly
2. Break down into smaller tasks
3. Design solution architecture
4. Write tests first (TDD when applicable)
5. Implement features iteratively
6. Code review and refactor
7. Test manually and automatically
8. Deploy to staging first
9. Monitor and gather feedback
10. Iterate based on learnings

## Quick Fire Technical Questions

**Q26-Q35: Short Answer Questions**

- **Q26:** What is the virtual DOM? *React's in-memory representation of the actual DOM*
- **Q27:** What's the difference between useEffect and useLayoutEffect? *useLayoutEffect runs synchronously after DOM mutations*
- **Q28:** What is prop drilling? *Passing props through multiple levels of components*
- **Q29:** What are React keys for? *Help React identify which items have changed*
- **Q30:** What is memoization? *Caching results of expensive function calls*
- **Q31:** What's the difference between null and undefined? *null is explicit absence, undefined is uninitialized*
- **Q32:** What is event delegation? *Handling events at parent level instead of each child*
- **Q33:** What is CORS? *Cross-Origin Resource Sharing security mechanism*
- **Q34:** What is tree shaking? *Removing unused code from final bundle*
- **Q35:** What is the difference between SSR and SSG? *SSR renders at request time, SSG at build time*

## Conclusion

These questions cover:
- ✅ Technical implementation details
- ✅ Architecture and design decisions
- ✅ Testing strategies
- ✅ Performance optimization
- ✅ Scalability considerations
- ✅ Security best practices
- ✅ Code quality improvements
- ✅ Real-world scenarios

Use these questions for:
- Interview preparation
- Code review discussions
- Feature planning sessions
- Knowledge sharing with team
- Onboarding new developers
