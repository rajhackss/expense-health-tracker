import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

/**
 * Generates configuration for a Chart.js chart.
 * @param {string} type - 'line', 'bar', 'doughnut', etc.
 * @param {string[]} labels - Array of labels for the X-axis or segments.
 * @param {number[]} data - Array of data points.
 * @param {string} label - Label for the dataset.
 * @param {string|string[]} color - Color(s) for the dataset.
 * @returns {object} - Configuration object for the chart component.
 */
export const renderChart = (type, labels, data, label, color) => {
    return {
        type,
        data: {
            labels,
            datasets: [
                {
                    label,
                    data,
                    backgroundColor: color,
                    borderColor: Array.isArray(color) ? color[0] : color,
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                title: {
                    display: true,
                    text: label,
                },
            },
        },
    };
};
