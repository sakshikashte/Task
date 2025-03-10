import React, { useEffect, useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./App.css";

const Orderscreen = () => {
  const [order, setOrder] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/ordersdata");
        const data = await response.json();
        setOrder(data);
        console.log("order data", data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
    fetchOrder();
  }, []);

  //serch data
  const filterOrderdata = order.filter(
    (order) =>
      (order.orderid && order.orderid.toString().includes(search)) ||
      (order.orderdescription &&
        order.orderdescription.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      <div className="container">
      {/* <button onClick={()=>navigate("kml")}>Kml file</button> */}
        <h2 style={{ textAlign: "center" }}> Order Management</h2>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by Order ID or Description"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button onClick={() => navigate("/neworder")}>New Order</button>
          
        </div>

        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Order Description</th>
              <th>Count Products</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filterOrderdata.map((order) => (
              <tr key={order.orderid}>
                {" "}
                {/* use the correct key */}
                <td>{order.orderid}</td> {/* use the correct key */}
                <td>{order.orderdescription}</td> {/* use the correct key */}
                <td>
                  <FaShoppingCart /> {order.productcount}{" "}
                  {/* use the correct key */}
                </td>
                <td>{new Date(order.createdat).toLocaleString()}</td>{" "}
                {/* use the correct key */}
                <td>
                  <button
                  className="editbtn"
                    onClick={() => navigate(`/editorder/${order.orderid}`)}
                  >
                    <FaEdit/>
                  </button>
                  <button
                  className="deletebtn"
                    onClick={async () => {
                      try {
                        const response = await fetch(
                          `http://localhost:5000/api/ordersdelete/${order.orderid}`,
                          {
                            method: "DELETE",
                          }
                        );
                        if (response.ok) {
                          setOrder(
                            order.filter((o) => o.orderid !== order.orderid)
                          );
                        } else {
                          console.error("Failed to delete order.");
                        }
                      } catch (error) {
                        console.error("Error deleting order:", error);
                      }
                    }}
                  >
                    <FaTrash/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Orderscreen;
