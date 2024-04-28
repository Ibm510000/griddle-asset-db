import aspose.threed

import os

# get the current working directory
current_working_directory = os.getcwd()

# print output to the console
print(current_working_directory)

scene = aspose.threed.Scene.from_file('temp.usda')
scene.save("temp.obj", aspose.threed.FileFormat.WAVEFRONT_OBJ)