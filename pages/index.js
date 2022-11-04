import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Chart from 'chart.js/auto'
import axios from 'axios';
import { useState } from 'react';
import { useRouter } from 'next/router';

import { useEffectAsync, isNetworkError } from '../helper';


import { Bar, Line } from 'react-chartjs-2';
import { useEffect } from 'react'

const lineOptions = {
    plugins: {
        legend: {
            postion: "right",
            align: "start",
            labels: {
                boxWidth: 10,
                usePointStyle: true,
                pointStyle: "circle",
            },
            title: {
                text: "Today's Water Level",
                display: true,
                color: '#000',
                font: {
                    size: 18,
                }
            }
        }
    },
    elements: {
        line: {
            tension: 0,
            borderWidth: 2,
            borderColor: 'rgb(47, 97, 68, 1)',
            fill: 'start',
            backgroundColor: 'rgb(47, 97, 68, 0.3)'
        },
        bar: {
            barPercentage: 0.3,
            categoryPercentage: 1,
        },
        point: {
            radius: 0,
            hitRadius: 0,
        }
    },
    scales: {
        xAxis: {
            display: true
        },
        yAxis: {
            display: true
        }
    }
}



const barOptions = {
    plugins: {
        legend: {
            postion: "right",
            align: "start",
            labels: {
                boxWidth: 25,
                usePointStyle: true,
                pointStyle: "circle",
            },
            title: {
                display: true,
                color: '#AC0000',
                font: {
                    size: 0,
                }
            }
        }
    },
    elements: {
        bar: {
            barPercentage: 0.1,
            categoryPercentage: 1,
        },
    },
    scales: {
        xAxis: {
            display: true
        },
        yAxis: {
            max: 100,
            display: true
        }
    }
}

const averageExtractor = (data, property) => {
    return data.map((day) => {
        const average = day.data.reduce((acc, curr) => {
            return acc + curr[property];
        }, 0);

        return average / day.data.length;
    })
}

const average = (data) => {
    return data.reduce((acc, curr) => {
        return acc + curr;
    }, 0) / data.length;
}

const getToday = () => {
    let rawDate = new Date().toISOString();
    let today = rawDate.slice(0, 10);
    return today;
}


export default function Home() {

    const [weekData, setWeekData] = useState([]);
    const [monthData, setMonthData] = useState([]);
    const [todayData, setTodayData] = useState([]);
    const [allData, setAllData] = useState([]);

    // set bar data
    const [barWeekData, setBarWeekData] = useState([]);
    const [barMonthData, setBarMonthData] = useState([]);
    const [barTodayData, setBarTodayData] = useState();


    const [latest, setLatest] = useState({
        time: 0,
        distance: 0,
        level: 0,
    });

    const [stats, setStats] = useState({
        "weekly": {
            "avgLevel": 0,
            "avgDistance": 0
        },
        "monthly": {
            "avgLevel": 0,
            "avgDistance": 0
        }
    });

    const router = useRouter();

    const updateWaterLevel = async () => {
        try {
            const currentLatestData = (await axios.get('http://localhost:2000/latest')).data?.data;
            setLatest(currentLatestData);
        } catch (error) {
            if (isNetworkError(error)) {
                console.log("Network Error");
            } else {
                console.log("fething lastest data -->", error);
            }
        }
    }


    useEffectAsync(async () => {

        if (!router.isReady) return;

        try {
            const currentWeekData = (await axios.get('http://localhost:2000/days?weekMode=true')).data?.data
            const currentMonthData = (await axios.get('http://localhost:2000/days')).data?.data
            const currentAllData = (await axios.get('http://localhost:2000/all')).data?.data
            const currentLatestData = (await axios.get('http://localhost:2000/latest')).data?.data


            // set data
            setWeekData(currentWeekData);
            setMonthData(currentMonthData);
            setAllData(currentAllData);
            setLatest(currentLatestData);

            const weekAverageWaterLevel = average(averageExtractor(currentWeekData, 'level'));
            const weekAverageWaterDistance = average(averageExtractor(currentWeekData, 'distance'));

            const monthAverageWaterLevel = average(averageExtractor(currentMonthData, 'level'));
            const monthAverageWaterDistance = average(averageExtractor(currentMonthData, 'distance'));


            setStats({
                weekly: {
                    avgLevel: weekAverageWaterLevel.toFixed(2),
                    avgDistance: weekAverageWaterDistance.toFixed(2),
                },
                monthly: {
                    avgLevel: monthAverageWaterLevel.toFixed(2),
                    avgDistance: monthAverageWaterDistance.toFixed(2),
                }
            })

            const todayData = currentMonthData.filter((day) => day._id === '2022-11-01')[0]?.data || [
                {
                    time: 0,
                    distance: 0,
                    level: 0,
                }
            ]
            setTodayData(todayData);


            if (todayData !== []) {
                // get latest data from today data based on time
                const latestData = todayData?.reduce((acc, curr) => {
                    if (acc.time > curr.time) {
                        return acc;
                    } else {
                        return curr;
                    }
                });

                setLatest(latestData);

                setBarTodayData({
                    labels: todayData?.map((data) => (new Date(data.time)).toTimeString().slice(0, 5)) || [],
                    datasets: [
                        {
                            label: 'Water Level',
                            data: todayData?.map((data) => data.level) || [],
                            backgroundColor: '#60A5FA',
                            barThickness: 20,
                        },
                        {
                            label: 'Water Distance',
                            data: todayData?.map((data) => data.distance) || [],
                            backgroundColor: '#AC0000',
                            barThickness: 20,
                        }
                    ]
                });
            }

        } catch (error) {
            if (isNetworkError(error)) {
                console.log("Network Error");
            } else {
                console.log("fething days data -->", error);
            }
        }
    }, [])

    // run effect every 2 minutes
    useEffect(() => {
        const interval = setInterval(async () => {
            await updateWaterLevel()
        }, 120000);
        return () => clearInterval(interval);
    }, [router]);





    return (
        <div className='w-full h-full '>



            <Head>
                <title>Create Next App</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>





            <main className='w-full h-full prose max-w-none text-center my-[50px]' >

                <h1>
                    Water Level Detector | Dashboard
                </h1>
                <div className='flex items-center justify-center my-[50px]'>
                    <div className="stats shadow bg-base-200 m-2 ">
                        <div className="stat place-items-center">
                            <div className="stat-title"></div>
                            <div className="stat-value">Weekly</div>
                            <div className="stat-desc"></div>
                        </div>
                        <div className="stat place-items-center">
                            <div className="stat-title">level (avg)</div>
                            <div className="stat-value text-secondary">
                                {stats.weekly.avgLevel} %
                            </div>
                        </div>
                        <div className="stat place-items-center">
                            <div className="stat-title">distance (avg) </div>
                            <div className="stat-value">{stats.weekly.avgDistance} cm
                            </div>
                        </div>
                    </div>

                    <div className="stats shadow bg-base-200 m-2 ">
                        <div className="stat place-items-center">
                            <div className="stat-title"></div>
                            <div className="stat-value">Monthly</div>
                            <div className="stat-desc"></div>
                        </div>
                        <div className="stat place-items-center">
                            <div className="stat-title">level (avg)</div>
                            <div className="stat-value text-secondary">
                                {stats.monthly.avgLevel} %
                            </div>
                        </div>
                        <div className="stat place-items-center">
                            <div className="stat-title">distance (avg) </div>
                            <div className="stat-value">{stats.monthly.avgDistance} cm
                            </div>
                        </div>
                    </div>
                </div>

                <div className="stats bg-primary text-primary-content">
                    <div className="stat">
                        <div className="stat-title">Current Level</div>
                        <div className="stat-value">
                            {Number(latest.level).toFixed(2)} %
                        </div>
                        <div className="stat-actions">
                            <button
                                className="btn btn-sm btn-success"
                                onClick={async () => {
                                    await updateWaterLevel()
                                }}
                            >Refresh</button>
                        </div>
                    </div>
                    <div className="stat">
                        <div className="stat-title">Current Distance</div>
                        <div className="stat-value">
                            {Number(latest.distance).toFixed(2)} cm
                        </div>
                    </div>
                </div>

                <div className="divider"></div>

                <div className='flex w-full items-center justify-center '>
                    <div className='flex w-full flex-col max-w-[800px]'>
                        {
                            barTodayData && (
                                <>
                                    <h1>
                                        Water Level Today
                                    </h1>
                                    <Bar
                                        data={barTodayData}
                                        options={barOptions}
                                    >
                                    </Bar>
                                </>
                            )
                        }
                    </div>
                </div>



            </main>

        </div>
    )
}
