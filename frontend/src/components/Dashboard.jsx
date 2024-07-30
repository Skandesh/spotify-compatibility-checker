import { useEffect, useState } from 'react';
import PlaylistViewer from './PlaylistViewer';
import PlaylistCreator from './PlaylistCreator';
import TrackSearch from './TrackSearch';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8888/me')
      .then((res) => res.json())
      .then((data) => {
        setUserData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!userData) {
    return <div>Error: Unable to retrieve user data.</div>;
  }

  return (
    <div>
      <h1>Welcome {userData}</h1>
      {/* <PlaylistCreator />
      <PlaylistViewer />
      <TrackSearch /> */}
    </div>
  );
};

export default Dashboard;
