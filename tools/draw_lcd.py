def print_lcd_mockup(state, temp, dist):
    print("=" * 20)
    print("|| " + f"Sys: {state}".ljust(14) + " ||")
    print("|| " + f"T:{temp}C D:{dist}cm".ljust(14) + " ||")
    print("=" * 20)

print_lcd_mockup("NORMAL", 27.5, 52.4)
print_lcd_mockup("WARNING", 28.3, 7.6)
print_lcd_mockup("EMERGENCY", "--.-", "--.-")
