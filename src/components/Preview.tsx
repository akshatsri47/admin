"use client"

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Package, RefreshCw, Calendar, CheckCircle } from 'lucide-react';

import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


 export const DashboardOverview = () => {
    const stats = [
        {
            label: 'Today Orders',
            value: '$897.40',
            icon: <Package className="w-8 h-8 text-white" />, 
            color: 'bg-green-500'
        },
        {
            label: 'Yesterday Orders',
            value: '$679.93',
            icon: <Package className="w-8 h-8 text-white" />, 
            color: 'bg-orange-500'
        },
        {
            label: 'This Month',
            value: '$13146.96',
            icon: <RefreshCw className="w-8 h-8 text-white" />, 
            color: 'bg-blue-500'
        },
        {
            label: 'Last Month',
            value: '$31964.92',
            icon: <Calendar className="w-8 h-8 text-white" />, 
            color: 'bg-teal-500'
        },
        {
            label: 'All-Time Sales',
            value: '$626513.05',
            icon: <Calendar className="w-8 h-8 text-white" />, 
            color: 'bg-green-600'
        }
    ];
        const lineChartData = [
        { name: 'Mar 1', sales: 400 },
        { name: 'Feb 28', sales: 300 },
        { name: 'Feb 27', sales: 200 },
        { name: 'Feb 26', sales: 250 },
        { name: 'Feb 25', sales: 200 },
        { name: 'Feb 24', sales: 500 },
        { name: 'Feb 23', sales: 900 }
    ];

    const pieChartData = [
        { name: 'Green Leaf Lettuce', value: 400, color: '#22c55e' },
        { name: 'Rainbow Chard', value: 300, color: '#3b82f6' },
        { name: 'Clementine', value: 300, color: '#f97316' },
        { name: 'Mint', value: 200, color: '#6366f1' }
    ];

    const orderSummary = [
        { label: 'Total Orders', value: 815, icon: <ShoppingCart className="w-6 h-6 text-orange-500" /> },
        { label: 'Orders Pending', value: 263, icon: <RefreshCw className="w-6 h-6 text-green-400" /> },
        { label: 'Orders Processing', value: 97, icon: <Package className="w-6 h-6 text-blue-400" /> },
        { label: 'Orders Delivered', value: 418, icon: <CheckCircle className="w-6 h-6 text-green-300" /> }
    ];

    return (
        <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold mb-4">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {stats.map((stat, index) => (
                    <Card key={index} className={`p-4 ${stat.color} text-white rounded-xl`}>
                        <CardContent className="flex flex-col items-center justify-center">
                            {stat.icon}
                            <p className="text-lg font-semibold mt-2">{stat.label}</p>
                            <p className="text-2xl font-bold">{stat.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {orderSummary.map((summary, index) => (
                    <Card key={index} className="flex items-center p-4 bg-white shadow-md rounded-xl">
                        <CardContent className="flex items-center gap-4">
                            <div className="p-2 bg-gray-100 rounded-full">
                                {summary.icon}
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">{summary.label}</p>
                                <p className="text-xl font-bold">{summary.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 bg-white shadow-md rounded-xl">
                    <CardContent>
                        <h3 className="text-lg font-bold mb-2">Weekly Sales</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={lineChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="sales" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="p-4 bg-white shadow-md rounded-xl">
                    <CardContent>
                        <h3 className="text-lg font-bold mb-2">Best Selling Products</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                    {pieChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        
        </div>
    );
};

export default DashboardOverview;
