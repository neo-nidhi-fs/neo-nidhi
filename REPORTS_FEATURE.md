# Admin Reports & Analytics Feature

## Summary

Created a comprehensive admin reports and analytics page with Highcharts integration for analyzing system metrics, transactions, and user data.

## Files Created

### 1. API Endpoint: `/src/app/api/admin/reports/route.ts`

- Fetches comprehensive report data from the database
- Calculates key metrics:
  - User statistics (total users, admins, active users)
  - Balance information (savings, FD, loans)
  - Interest accrual data
  - Transaction analysis by type and amount
  - Scheme-wise user distribution
  - Monthly transaction trends
  - User balance distribution ranges

### 2. Reports Page: `/src/app/admin/reports/page.tsx`

Client-side page with interactive Highcharts visualizations including:

#### Key Metrics Cards

- Total Users
- Total Admins
- Active Users
- Total Savings Balance
- Total FD Balance
- Total Loan Balance

#### Charts

1. **Interest Accrued Summary** (Column Chart)
   - Displays total savings interest, FD interest, and loan interest

2. **Transaction Types Distribution** (Pie Chart)
   - Shows count of each transaction type

3. **User Distribution by Scheme** (Doughnut Chart)
   - Breakdown of users across deposit, FD, and loan schemes

4. **User Balance Distribution** (Column Chart)
   - Distribution of users by balance ranges (0-10k, 10k-50k, 50k-100k, 100k+)

5. **Monthly Transaction Trends** (Line Chart)
   - Transaction count trends over the last 12 months

6. **Transaction Amount by Type** (Bar Chart)
   - Total transaction amounts grouped by type

## UI Features

- Responsive design with Tailwind CSS
- Beautiful gradient backgrounds and styling
- Loading state with spinner
- Error handling
- Mobile-friendly grid layout
- Color-coded metrics cards

## Dependencies Added

- `highcharts` (v12.5.0) - Charting library
- `highcharts-react-official` (v3.2.3) - React wrapper for Highcharts

## Navigation

- Added "View Reports" button in Admin Dashboard linking to `/admin/reports`
- Easily accessible from the main admin dashboard page

## Access

Admin users can access the reports page at:

- `/admin/reports` - via the "View Reports" button on the admin dashboard
- Or directly navigate to the endpoint

## Data Visualizations

All charts include:

- Proper labels and titles
- Data labels for easy reading
- Color-coded visualization
- Interactive tooltips (on hover)
- Responsive sizing for different screen sizes

## Notes

- The reports page is a client-side component that fetches data from the API
- All data is calculated dynamically from the MongoDB database
- The page includes comprehensive error handling and loading states
- Charts are automatically colorized for better visual appeal
