import numpy as np

data = np.array([12, 15, 12, 18, 20, 25, 30, 12, 45])

# Central Tendency
mean_val = np.mean(data)
median_val = np.median(data)

# Dispersion
std_dev = np.std(data)      # Standard Deviation
variance = np.var(data)     # Variance
data_range = np.ptp(data)   # "Peak-to-Peak" (Max - Min)

# Percentiles and Quartiles
q1 = np.percentile(data, 25)
q3 = np.percentile(data, 75)
iqr = q3 - q1