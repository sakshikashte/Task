import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./App.css";

const Orderform = () => {
  const [orderDescription, setOrderDescription] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const navigate = useNavigate();
  const { orderId } = useParams();

  useEffect(() => {
    // Fetch all products using fetch API
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/products");
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        setProducts(data);
        console.log("productdata", data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();


    if (orderId) {
        const fetchOrderDetails = async () => {
          try {
            const response = await fetch(
              `http://localhost:5000/api/ordersedit/${orderId}`
            );
            if (!response.ok) {
              throw new Error("Failed to fetch order details");
            }
            const data = await response.json();
            setOrderDescription(data.orderDescription);
            setSelectedProducts(data.products.map((p) => p.id)); // Assuming response gives you product IDs
          } catch (error) {
            console.error("Error fetching order details:", error);
          }
        };
        fetchOrderDetails();
      }
  }, [orderId]);

  
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = orderId ? 'PUT' : 'POST';  // Use PUT if we're editing an existing order
      const url = orderId
        ? `http://localhost:5000/api/ordersedit/${orderId}`  // For editing
        : `http://localhost:5000/api/orders`;  // For creating new
  
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderDescription,
          productIds: selectedProducts,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to ${orderId ? 'update' : 'create'} order`);
      }
  
      const result = await response.json();
      console.log(result);
      navigate("/");  // Redirect after successful update or creation
    } catch (error) {
      console.error("Error creating/updating order:", error);
    }
  };
  

  return (
    <>
      <div className="form-container">
      <h1>{orderId ? 'Edit Order' : 'Book New Order'}</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label style={{textAlign:'left'}}>Order Description:</label>
            <input
              type="text"
              value={orderDescription}
              onChange={(e) => setOrderDescription(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Select Products:</label>
            {products.map((product) => (
              <div key={product.id} className="checkbox-group">
                <input
                  type="checkbox"
                  value={product.id}
                  onChange={(e) => {
                    const id = parseInt(e.target.value);
                    setSelectedProducts((prev) =>
                      prev.includes(id)
                        ? prev.filter((pid) => pid !== id)
                        : [...prev, id]
                    );
                  }}
                />
                <label>{product.productname}</label>
              </div>
            ))}
          </div>
          <div className="form-actions">
          <button type="submit">{orderId ? 'Update Order' : 'Submit'}</button>
            <button type="button" onClick={() => navigate("/")}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Orderform;
