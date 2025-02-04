import './App.css';
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import Navbar from './layout/NavBar';
import Home from './pages/Home';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
 
import EditUser from './users/EditUsers';
import ViewDriver from './users/ViewDriver'; // Fixed incorrect filename casing
import RouteOptimizer from './map/RouteOptimizer';
import AddUsers from './users/AddUsers';
 

 
 
 
function App() {
  return (
    <div className="App">
      <Router>
        {/* Navigation bar */}
        <Navbar />
        <Routes>
          {/* Define all application routes */}
           
          <Route exact path="/" element={<AddUsers/>} />
          
          <Route exact path="/edituser/:id" element={<EditUser />} />
          <Route exact path="/viewdriver/:id" element={<ViewDriver />} />
          
          <Route exact path="/adduser" element={<AddUsers/>} />
          
        </Routes>
      </Router>
    </div>
  );
}

export default App;
