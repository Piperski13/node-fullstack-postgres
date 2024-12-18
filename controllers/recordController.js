const Record = require("../model/recordsModel.js");
const path = require("path");

// CRUD HANDLERS START
const getAllRecords = async (req, res) => {
  try {
    const allRecords = await Record.getAll();

    if (!allRecords || allRecords.length === 0) {
      return res.status(404).json({ message: "No records found." });
    }

    res.status(200).json(allRecords);
  } catch (error) {
    console.error("Error fetching records:", error.message);
    res.status(500).json({
      error: "An error occurred while fetching records.",
      details: error.message,
    });
  }
};

const getRecord = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const record = await Record.getById(id);
    res.status(200).json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addRecord = async (req, res) => {
  try {
    const {
      nazivelektrane,
      mesto,
      adresa,
      datumpustanjaurad,
      sifravrstepogona,
    } = req.body;

    const newRecord = await Record.add({
      nazivelektrane,
      mesto,
      adresa,
      datumpustanjaurad,
      sifravrstepogona,
    });
    res.status(201).json({
      message: `Record added with ID: ${newRecord.id}`,
      sifravrstepogona: newRecord.sifravrstepogona,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteRecord = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const results = await Record.deleteById(id);

    if (results.rowCount === 0) {
      res.status(404).json({ message: `Record with ${id} was not found ` });
    }
    const deletedRecord = results[0];
    res.status(200).json({
      message: `Deleted Record with ID ${id}`,
      sifravrstepogona: deletedRecord.sifravrstepogona,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateRecord = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const {
      nazivelektrane,
      mesto,
      adresa,
      datumpustanjaurad,
      sifravrstepogona,
    } = req.body;

    await Record.updateById({
      id,
      nazivelektrane,
      mesto,
      adresa,
      datumpustanjaurad,
      sifravrstepogona,
    });

    res.status(200).json({
      message: `Record with ID: ${id} updated sucessfully`,
      sifravrstepogona: sifravrstepogona,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// CRUD HANDLERS END

// small table (vrstapogona) START
const getPowerPlants = async (req, res) => {
  try {
    const allPlants = await Record.getAllPlants();
    res.status(200).json(allPlants);
  } catch (error) {
    res.status(500).json({ error: "Get Power Plants query failed" });
  }
};
// small table (vrstapogona) END

// record filtering START
const filterRecords = async (req, res) => {
  try {
    const name = req.query.name || ""; // Get the query parameter 'name'

    // Query the filtered data from the database
    const data = await Record.filterData(name);

    // Generate table rows dynamically
    const tableRows = data
      .map((record) => {
        const date = new Date(record.datumpustanjaurad); // Convert the ISO string to a Date object
        const formattedDate = date.toISOString().split("T")[0]; // Format 'YYYY-MM-DD'
        return `
        <tr>
          <td>${record.id}</td>
          <td>${record.nazivelektrane}</td>
          <td>${record.mesto}</td>
          <td>${record.adresa}</td>
          <td>${formattedDate}</td>
          <td>${record.sifravrstepogona}</td>
          <td><button class="update-record" onclick="redirectUpdate(${record.id})">Update</button></td>
          <td><button class="delete-record" onclick="deleteRecord(${record.id})">Delete</button></td>
        </tr>`;
      })
      .join(""); // Combine all rows into a single string

    if (name) {
      // Generate filtered HTML
      const filteredHtml = `
    <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <!-- account,menu icon bellow -->
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=account_circle,menu"
          />
          <link rel="stylesheet" href="../styles/navbar.css" />
          <link rel="stylesheet" href="../styles/recordView.css" />
          <title>CRUD</title>
        </head>
        <body>
          <header id="main-box">
            <nav>
              <span class="material-symbols-outlined hamburger">menu</span>
              <div class="sidebar">
                <div id="menu" class="menu">
                  <a href="/welcome.html">Home</a>
                  <a href="/recordsViewPage" id="view-records-js">View All Records</a>
                  <a href="/addRecordPage" id="add-record-js">Add Record</a>
                </div>
                <div class="logout-style">
                  <div class="user-dropdown">
                    <span class="username-logged">
                      <span class="material-symbols-outlined icon">
                        account_circle
                      </span>
                      <span id="logged-user-js" class="logged-user"></span>
                    </span>
                    <div class="dropdown-content">
                      <a href="#" id="logout-js">Logout</a>
                    </div>
                  </div>
                </div>
              </div>
            </nav>
            <div class="div-tables-section">
              <table id="small-table">
                <caption class="small-table-caption">
                  Ukupan Broj Evidencija
                </caption>
                <thead>
                  <tr>
                    <th>Voda (0)</th>
                    <th>Vetar (1)</th>
                    <th>Ugalj (2)</th>
                  </tr>
                </thead>
                <tbody id="types-table"></tbody>
              </table>
              <p class="table-text-bellow">*max records per type = 10</p>
              <table>
                <form id="filter-form">
                  <label for="filter-name">Filter by Name</label>
                  <input
                    id="filter-name-input"
                    class="filter-name-input-class"
                    name="filter-name"
                    type="text"
                    placeholder="Naziv elektrane"
                  />
                  <div class="filter-submit">
                    <button type="submit" id="submit-filter" class="form-submit-filter">Filter</button>
                  </div>
                </form>
                <caption>
                  Lista Evidencija Elektrana
                </caption>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Naziv Elektrane</th>
                    <th>Mesto</th>
                    <th>Adresa</th>
                    <th>Datum Puštanja u Rad</th>
                    <th>Šifra Vrste Pogona</th>
                    <th>Ažuriraj</th>
                    <th>Obriši</th>
                  </tr>
                </thead>
                <tbody id="records-table">${tableRows}</tbody>
              </table>
            </div>
          </header>

          <script src="../scripts/filter/filter.js"></script>
          <script src="../scripts/hamburger_menu/toggleMenu.js"></script>
          <script src="../scripts/auth/decodedToken.js"></script>
          <script src="../scripts/crud/view-delete.js"></script>
          <script src="../scripts/auth/logout.js"></script>
        </body>
      </html>
    `;
      return res.send(filteredHtml);
    }

    // If no filter is applied, serve the static records view page
    res.sendFile(path.join(__dirname, "../public/View/recordsView.html"));
  } catch (error) {
    console.error("Error processing request:", error.message);
    res.status(500).send("Internal Server Error");
  }
};
// record filtering END

module.exports = {
  getAllRecords,
  getRecord,
  addRecord,
  deleteRecord,
  updateRecord,
  getPowerPlants,
  filterRecords,
};
