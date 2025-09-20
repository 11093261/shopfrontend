import { Outlet } from 'react-router-dom';
import Header from './Components/Header'; // Import your Header component
// import Footer from './Components/Footer'; // Import your Footer component

function Body() {
  return (
    <div className="app-container">
      <main className="main-content">
        <Header />
        <Outlet />
      </main>
    
    </div>
  );
}

export default Body;