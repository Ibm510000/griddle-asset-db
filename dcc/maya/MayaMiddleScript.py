
import sys
import os
import psutil

cwd = os.getcwd()

def writeToDir(a):
    cwd = os.getcwd()
    newFileDir = cwd+"\\..\\dcc\\maya\\dir.txt"
    open(newFileDir, 'w').close()
    f = open(newFileDir, "w")
    f.write(a)
    f.close()

    




def check_if_process_running(process_name):
    for process in psutil.process_iter(['name']):
        if process .info['name'] == process_name:
            return True
    return False

    

if __name__ == "__main__":
    a = sys.argv[1]
    check = check_if_process_running("maya.exe")
    if not check:
        os.system("start maya.exe") 

    #print(check)
    writeToDir(a)