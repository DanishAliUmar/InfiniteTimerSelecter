import Timer from './Components/Timer';

const App = () => {
    const handleTimeUpdate = (minutes, seconds) => {
        console.log('Selected Time:', minutes, seconds);
    };

    return (
        <div>
            <Timer onTimeUpdate={handleTimeUpdate} />
        </div>
    );
};

export default App;
