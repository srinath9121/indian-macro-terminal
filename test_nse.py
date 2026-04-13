from nse import NSE

n = NSE(download_folder='.')
methods = [m for m in dir(n) if not m.startswith('_')]
print("NSE Methods:", methods)
