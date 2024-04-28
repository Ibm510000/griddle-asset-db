# hou is the Houdini module, which will only be available after Houdini launches
import hou
import argparse

# command line flags
parser = argparse.ArgumentParser()
parser.add_argument("-a", "--assetname", required=True, help="Enter the asset name")
parser.add_argument("-o", "--originalDir", help="Enter the original asset directory to read your old asset USDs from")
parser.add_argument("-n", "--newDir", help="Enter the new asset directory you want your asset USDs to output to")
args = parser.parse_args()

# TODO: check whether to launch Update or CreateNew template
#	if Update: check which subnetwork to switch to

asset_name = hou.node("stage/load_class_asset_update").parm("asset_name")
original_asset_directory = hou.node("stage/load_class_asset_update").parm("original_asset_directory")
new_asset_directory = hou.node("stage/load_class_asset_update").parm("new_asset_directory")

asset_name.set(args.assetname)
original_asset_directory.set(args.originalDir)
new_asset_directory.set(args.newDir)