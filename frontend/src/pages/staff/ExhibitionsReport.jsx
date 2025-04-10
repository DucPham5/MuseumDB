import { useState, useEffect } from "react";
import "../../styles/reports.css"; // Custom CSS file for report styles

const ExhibitionReport = () => {
  const [exhibitions, setExhibitions] = useState([]);
  const [exhibitionPurchases, setExhibitionPurchases] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  // Date filter state variables
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  // Special exhibition filter: "" for all, "special" for those that require a ticket, "regular" for those that do not.
  const [specialFilter, setSpecialFilter] = useState("");

  useEffect(() => {
    fetchExhibitions();
    fetchExhibitionPurchases();
  }, []);

  const fetchExhibitions = async () => {
    try {
      const response = await fetch("https://museumdb.onrender.com/exhibition-report");
      if (!response.ok) {
        throw new Error("Failed to fetch exhibitions");
      }
      const data = await response.json();
      console.log("Fetched Exhibitions Data:", data);
      if (Array.isArray(data)) {
        setExhibitions(data);
      } else {
        console.error("Exhibitions data is not an array:", data);
        setExhibitions([]);
      }
    } catch (error) {
      console.error("Error fetching exhibitions:", error);
    }
  };

  const fetchExhibitionPurchases = async () => {
    try {
      const response = await fetch("https://museumdb.onrender.com/exhibition-purchases");
      if (!response.ok) {
        throw new Error("Failed to fetch exhibition purchase data");
      }
      const data = await response.json();
     
      setExhibitionPurchases(data);
    } catch (error) {
      console.error("Error fetching exhibition purchases:", error);
    }
  };

  // Helper function to format a Date as "YYYY-MM-DD"
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Quick filter functions for date ranges
  const setLastWeek = () => {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    setFilterStartDate(formatDate(lastWeek));
    setFilterEndDate(formatDate(today));
  };

  const setLastMonth = () => {
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setMonth(today.getMonth() - 1);
    setFilterStartDate(formatDate(lastMonth));
    setFilterEndDate(formatDate(today));
  };

  const setLastYear = () => {
    const today = new Date();
    const lastYear = new Date(today);
    lastYear.setFullYear(today.getFullYear() - 1);
    setFilterStartDate(formatDate(lastYear));
    setFilterEndDate(formatDate(today));
  };

  const clearDateFilter = () => {
    setFilterStartDate("");
    setFilterEndDate("");
  };

  // Handler for the quick date range dropdown change
  const handleQuickFilterChange = (e) => {
    const option = e.target.value;
    if (option === "lastWeek") {
      setLastWeek();
    } else if (option === "lastMonth") {
      setLastMonth();
    } else if (option === "lastYear") {
      setLastYear();
    } else {
      clearDateFilter();
    }
  };

  // Handler for special exhibition filter dropdown
  const handleSpecialFilterChange = (e) => {
    setSpecialFilter(e.target.value);
  };

  // Filter exhibitions based on search, date range (using both Start_Date and End_Date) and special filter.
  const filteredExhibitions = exhibitions.filter((exhibition) => {
    const exhibitionNameMatch = exhibition.Name.toLowerCase().includes(searchQuery.toLowerCase());
    const exhibitionStart = new Date(exhibition.Start_Date);
    const exhibitionEnd = new Date(exhibition.End_Date);
    // Check that the exhibition's End_Date is on/after filterStartDate
    // and its Start_Date is on/before filterEndDate.
    const passesStartFilter = filterStartDate ? exhibitionEnd >= new Date(filterStartDate) : true;
    const passesEndFilter = filterEndDate ? exhibitionStart <= new Date(filterEndDate) : true;

    let specialMatch = true;
    if (specialFilter === "special") {
      specialMatch = exhibition.requires_ticket === 1;
    } else if (specialFilter === "regular") {
      specialMatch = exhibition.requires_ticket === 0;
    }

    return exhibitionNameMatch && passesStartFilter && passesEndFilter && specialMatch;
  });

  // Helper: Get aggregated purchase data for an exhibition.
  const getAggregatedDataForExhibition = (exhibition) => {
    const agg = exhibitionPurchases.find(
      (item) => Number(item.Exhibition_ID) === Number(exhibition.Exhibition_ID)
    );
    if (!agg) {
      console.log(`For exhibition ${exhibition.Exhibition_ID}, no aggregated record found—using default.`);
      return { Tickets_Bought: 0, Amount_Made: 0 };
    }
    console.log(`For exhibition ${exhibition.Exhibition_ID}, aggregated data:`, agg);
    return agg;
  };

  // Compute totals:
  // For special exhibitions (requires_ticket true), sum each exhibition's aggregated value individually.
  const specialExhibitions = filteredExhibitions.filter(
    (ex) => ex.requires_ticket === 1
  );
  const specialTotalAmount = specialExhibitions.reduce((acc, ex) => {
    const agg = getAggregatedDataForExhibition(ex);
    return acc + Number(agg.Amount_Made || 0);
  }, 0);
  const specialTotalTickets = specialExhibitions.reduce((acc, ex) => {
    const agg = getAggregatedDataForExhibition(ex);
    return acc + Number(agg.Tickets_Bought || 0);
  }, 0);

  // For regular exhibitions (requires_ticket false), take the aggregated data
  // from the first regular exhibition only (to avoid duplication).
  const regularExhibitions = filteredExhibitions.filter(
    (ex) => ex.requires_ticket === 0
  );
  let regularTotalAmount = 0;
  let regularTotalTickets = 0;
  if (regularExhibitions.length > 0) {
    const firstRegular = regularExhibitions[0];
    const agg = exhibitionPurchases.find(
      (item) => Number(item.Exhibition_ID) === Number(firstRegular.Exhibition_ID)
    );
    if (agg) {
      regularTotalAmount = Number(agg.Amount_Made);
      regularTotalTickets = Number(agg.Tickets_Bought);
    }
  }

  // Combine the totals: special sums added individually and regular aggregated once.
  const totalAmountMade = specialTotalAmount + regularTotalAmount;
  const totalTicketsBought = specialTotalTickets + regularTotalTickets;
  const totalComplaints = filteredExhibitions.reduce((acc, ex) => acc + Number(ex.complaintCount || 0), 0);

  return (
    <main className="exh-report-container">
      <div className="exh-report-header">
        <h1>Exhibition Report</h1>
      </div>

      {/* Combined Controls: Quick Date Range Dropdown, Manual Date Inputs, Special Filter, and Search Bar */}
      <div className="exh-report-controls">
        <div className="exh-report-date-controls">
          <div className="exh-report-date-select">
            <select id="quickDateRange" onChange={handleQuickFilterChange}>
              <option value="">--Select Range--</option>
              <option value="lastWeek">Last Week</option>
              <option value="lastMonth">Last Month</option>
              <option value="lastYear">Last Year</option>
              <option value="clear">Clear</option>
            </select>
          </div>
          <div className="exh-report-manual-dates">
            <div>
              <label htmlFor="startDate">Start Date:</label>
              <input
                id="startDate"
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="endDate">End Date:</label>
              <input
                id="endDate"
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
              />
            </div>
          </div>
          <div className="exh-report-special-filter">
            <label htmlFor="specialFilter">Special Exhibition:</label>
            <select id="specialFilter" onChange={handleSpecialFilterChange}>
              <option value="">All</option>
              <option value="special">Special Only</option>
              <option value="regular">Regular Only</option>
            </select>
          </div>
        </div>
        <div className="exh-report-search">
          <input
            type="text"
            placeholder="Search exhibitions..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Total Summary Section */}
      <div className="exh-report-summary">
        <div>Total Exhibits: {filteredExhibitions.length}</div>
        <div>Total Tickets Bought: {totalTicketsBought}</div>
        <div>Total Amount Made: ${parseFloat(totalAmountMade).toLocaleString()}</div>
        <div>Total Feedback: {totalComplaints}</div>
      </div>

      {/* Exhibitions Table */}
      <div className="exh-report-table-container">
        <table className="exh-report-table">
          <thead>
            <tr>
              <th>Exhibit Name</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Special Exhibition</th>
              <th>Tickets Bought</th>
              <th>Amount Made ($)</th>
              <th># Of Reviews</th>
              <th>Average Rating</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredExhibitions.map((exhibition) => {
              const agg = getAggregatedDataForExhibition(exhibition);
              return (
                <tr key={exhibition.Exhibition_ID}>
                  <td>{exhibition.Name}</td>
                  <td>{new Date(exhibition.Start_Date).toLocaleDateString()}</td>
                  <td>{new Date(exhibition.End_Date).toLocaleDateString()}</td>
                  <td>{(exhibition.requires_ticket === true || exhibition.requires_ticket === 1) ? "Yes" : "No"}</td>
                  <td>{agg.Tickets_Bought}</td>
                  <td>${parseFloat(agg.Amount_Made).toLocaleString()}</td>
                  <td>{exhibition.complaintCount}</td>
                  <td>{exhibition.averageReview !== null ? Number(exhibition.averageReview).toFixed(1) : 'N/A'}</td>
                  <td>
                    {exhibition.IsActive ? (
                      <span className="badge-active">Active</span>
                    ) : (
                      <span className="badge-inactive">Inactive</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default ExhibitionReport;

