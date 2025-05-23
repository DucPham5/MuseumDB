import { useState, useEffect } from "react";
import "../../styles/manage.css";
import "../../styles/admin.css";
//need to do restock created a modal that popsup; should take the amount/productid and send to backend
const ManageGiftshop = () => {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [restockModal, setRestockModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [restockAmount, setRestockAmount] = useState(null);
  const [selectedProductId, setselectedProductId] = useState(null);
  const [categories, setCategories] = useState([])
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");
  const [newProduct, setNewProduct] = useState({
    Name: "", Category_ID: "", Price: "", Stock_Quantity:"", Description:"" ,image: null});

    useEffect(() => {
        fetchProducts();
        fetchCategories();
      }, []);
    
      const fetchProducts = async () => {
        try {
          const response = await fetch("https://museumdb.onrender.com/manageGiftshop");
          if (!response.ok) {
            throw new Error("Failed to fetch exhibitions");
          }
          const data = await response.json();
          if (Array.isArray(data)) {
            setProducts(data);
          } else {
            console.error("Data is not an array:", data);
            setExhibitions([]);
          }
        } catch (error) {
          console.error("Error fetching exhibitions:", error);
        }
      };

      const addProduct = async () => {
        const reader = new FileReader();
      
        reader.readAsDataURL(newProduct.image);
      
        reader.onload = async () => {
          const base64String = reader.result.split(',')[1];
      
          const productData = {
            ...newProduct,
            Price: parseFloat(newProduct.Price),
            Stock_Quantity: parseInt(newProduct.Stock_Quantity),
            image_data: base64String,
          };
          console.log("Submitting Product:", productData);
      
          try { 
            const response = await fetch("https://museumdb.onrender.com/manageGiftshop", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(productData), 
            });
      
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
      
            const result = await response.json();
            fetchProducts();
            setIsModalOpen(false);
            console.log("Server Response: ", result);
          } catch (error) {
            console.error("Error creating product:", error);
          }
        };
      };
      
      

      const handleInputChange = (e) => {
        const {name, value} = e.target;
        if(name == "restockAmount"){
          setRestockAmount(value);
        }
        else{
        setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
        }
    };

    const fetchCategories = async () =>{
        try{
            const response = await fetch("https://museumdb.onrender.com/giftshop");
            const data = await response.json();
            console.log("Fetched Category Data", data);
            setCategories(data);
        }
        catch(error){
            console.error("Error fetching categories:", error);
        }
    }


    const handleCategoryChange = (e) => {
        const selectedName = e.target.value;
        const match = categories.find((cat) => cat.Name === selectedName);
        const categoryId = match ? match.Category_ID : "";
      
        setNewProduct((prev) => ({
          ...prev,
          Category_ID: categoryId,
        }));
      };
    // const handleCategoryChange = (e) => {
    //   setNewProduct((prev) => ({
    //     ...prev,
    //     Category_ID: parseInt(e.target.value), // ensure it's a number
    //   }));
    // };
    

      const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
          setNewProduct((prev) => ({ ...prev, image: file }));
        }
      };
      
      const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
          setNewProduct((prev) => ({ ...prev, image: file }));
        }
      };
      
      // Function to restock products
      const handleRestock = async() => {
        if (!restockAmount || isNaN(restockAmount)) {
          alert("Please enter a valid restock amount.");
          return;
        }
        console.log("Restocking:", selectedProductId, restockAmount);
        const restockData = {
          Product_ID: selectedProductId,
          restock_Amount: Number(restockAmount),
        }

        try {
          const response = await fetch("https://museumdb.onrender.com/manageGiftshop", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(restockData), 
          });
    
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
    
          const result = await response.json();
          fetchProducts();
          setRestockModal(false);
          setRestockAmount(null);
          setselectedProductId(null);
          console.log("Server Response: ", result);
        } catch (error) {
          console.error("Error creating product:", error);
        }
        
      };

      // Function to delete products referring to cart route since it already has a delete query
      const handleDelete = async () => {
        try {
          const response = await fetch("https://museumdb.onrender.com/manageGiftshop", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({Product_ID: selectedProductId}), 
          });
    
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
    
          const result = await response.json();
          fetchProducts();
          setDeleteModal(false);
          setselectedProductId(null);
          console.log("Server Response: ", result);
        } catch (error) {
          console.error("Error creating product:", error);
        }
      };


  return (
    <div className="manage-wrapper">
      <div className="manage-header">
        <h1>Manage Giftshop</h1>
        <div style={{ display: "flex", gap: "10px" }}>
    <select
      className="report-dropdown"
      value={selectedCategoryFilter}
      onChange={(e) => setSelectedCategoryFilter(e.target.value)}
    >
      <option value="All">All Categories</option>
      {categories.map((cat) => (
        <option key={cat.Category_ID} value={cat.Name}>
          {cat.Name}
        </option>
      ))}
    </select>

    <button className="add-btn" onClick={() => setIsModalOpen(true)}>
      Add Product
    </button>
  </div>
      </div>
      <table className="manage-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock Quantity</th>
            <th>Description</th>
            <th>Actions</th>
            {/* <th>Tickets Sold</th>
            <th>Themes</th>
            <th># Artworks</th> */}
          </tr>
        </thead>
        <tbody>
          {products
          .filter((product) =>
            selectedCategoryFilter === "All"
              ? true
              : categories.find((cat) => cat.Category_ID === product.Category_ID)?.Name === selectedCategoryFilter
          ).map((product) => (
            <tr key={product.Product_ID}>
            <td>{product.Product_ID}</td>
              <td>{product.Name}</td>
              <td>{product.Category_ID === 1 ? 'Painting' :
                    product.Category_ID === 2 ? 'Jewlry' :
                    product.Category_ID === 3 ? 'Books' :
                    product.Category_ID === 4 ? 'Toys & Games' :
                    product.Category_ID === 5 ? 'Home & Decor' :
                    product.Category_ID === 6 ? 'Arts & Crafts' :
   'Unknown'}</td>
              <td>{product.Price}</td>
              <td>{product.Stock_Quantity}</td>
              <td>{product.Description}</td>
              <td>
              <button className = "restock-btn" onClick={() => {setselectedProductId(product.Product_ID); setRestockModal(true)}}>Restock</button>
              <button className = "delete-btn"onClick={() => {setselectedProductId(product.Product_ID); setDeleteModal(true)}}>Delete</button>
              </td>
              {/* <td>${parseFloat(exhibition.Budget).toLocaleString()}</td>
              <td>{exhibition.Location}</td>
              <td>{exhibition.Num_Tickets_Sold}</td>
              <td>{exhibition.Themes}</td>
              <td>{exhibition.Num_Of_Artworks}</td> */}
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Add New Product</h2>
                        <input type="text" name="Name" placeholder="Product Name" value={newProduct.Name} onChange={handleInputChange} className="input-field" />
                        <input type="number" name="Price" placeholder="Price" value={newProduct.Price} onChange={handleInputChange} className="input-field" />
                        <input type="number" name="Stock_Quantity" placeholder="Stock Quantity" value={newProduct.Stock_Quantity} onChange={handleInputChange} className="input-field" />
                        <textarea name="Description" placeholder="Description" value={newProduct.Description} onChange={handleInputChange} className="input-field" />
                        <select onChange={handleCategoryChange}  className="input-field">
                        <option value="category">Select Category</option>
                        {categories.map((cat) => (
                            <option key={cat.Category_ID} value={cat.Name}>
                            {cat.Name}
                            </option>
                        ))}
                        </select>
                        <div
                        /**handles drop file change */
                            className="drop-zone"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            >
                            {newProduct.image ? (
                                <img
                                src={URL.createObjectURL(newProduct.image)}
                                alt="Uploaded Preview"
                                className="preview-image"
                                />
                            ) : (
                                <p className="drop-text">Drop image here or click to upload</p>
                            )}
                            
                            <input
                            /**handles input/clicked file change */
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="file-input"
                            />
                        </div>

                        
                        <div className="modal-buttons">
                            <button className="add-employee-button" onClick={addProduct}>Add Product</button>
                            <button className="close-modal-button" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            {restockModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Restock Product</h2>
                        <input type="number" name="restockAmount" placeholder="Restock Amount" value={restockAmount || ""} onChange={handleInputChange} className="input-field" />
                        <div className="modal-buttons">
                            <button className="add-employee-button" onClick={handleRestock}>Restock</button>
                            <button className="close-modal-button" onClick={() => setRestockModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            {deleteModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Delete this product? </h2>
                        <div className="modal-buttons">
                            <button className="add-employee-button" onClick={handleDelete}>Delete</button>
                            <button className="close-modal-button" onClick={() => setDeleteModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
    </div>
  );
};

export default ManageGiftshop;
