# hou is the Houdini module, which will only be available after Houdini launches
import hou
import argparse
import os

def is_class_asset_structure(source_folder, asset_name):
    is_root_existing = os.path.exists(os.path.join(source_folder, f'{asset_name}.usda'))
    # only check if one LOD exists
    is_LOD_existing = os.path.exists(os.path.join(source_folder, f'{asset_name}LOD0.usda'))
    is_geometry_existing = os.path.exists(os.path.join(source_folder, f'{asset_name}_model.usda'))
    is_material_existing = os.path.exists(os.path.join(source_folder, f'{asset_name}_material.usda'))
    return is_root_existing and is_LOD_existing and is_geometry_existing and is_material_existing

def is_houdini_asset_structure(source_folder):
    is_root_existing = os.path.exists(os.path.join(source_folder, 'root.usda'))
    is_geometry_dir = os.path.isdir(os.path.join(source_folder, 'Geometry'))
    is_material_dir = os.path.isdir(os.path.join(source_folder, 'Material'))
    return is_root_existing and is_material_dir and is_geometry_dir

if __name__ == "__main__":
    # command line flags
    parser = argparse.ArgumentParser()
    parser.add_argument("-a", "--assetname", required=True, help="Enter the asset name")
    parser.add_argument("-o", "--original", required=True, help="Enter the original asset directory to read your old asset USDs from")
    parser.add_argument("-n", "--new", help="Enter the new asset directory you want your asset USDs to output to")
    args = parser.parse_args()

    assetname = args.assetname
    source_folder = args.original

    if os.path.isdir(source_folder):
        # launching Update.hipnc template
        # assets in old hw10 structure
        if is_class_asset_structure(source_folder, assetname):
            print('Old asset structure')

            # get and set houdini node parameters
            class_structure_node = hou.node("stage/load_class_asset_update")
            asset_name = class_structure_node.parm("asset_name")
            original_asset_directory = class_structure_node.parm("original_asset_directory")
            new_asset_directory = class_structure_node.parm("new_asset_directory")

            asset_name.set(assetname)
            original_asset_directory.set(source_folder)
            new_asset_directory.set(args.new)

            # set this node as the current selected and display output in viewport
            class_structure_node.setDisplayFlag(True)
            class_structure_node.setCurrent(True, True)

        # assets in new houdini structure
        elif is_houdini_asset_structure(source_folder):
            print('New houdini asset structure')

            new_structure_node = hou.node("stage/load_new_asset_update")
            asset_name = new_structure_node.parm("asset_name")
            asset_root_directory = new_structure_node.parm("asset_root_directory")
            asset_name.set(assetname)
            asset_root_directory.set(source_folder)
            
            new_structure_node.setDisplayFlag(True)
            new_structure_node.setCurrent(True, True)

        # launching CreateNew.hipnc template
        else:
            print('Creating new asset')

            create_asset_node = hou.node("stage/create_new_asset")
            asset_name = create_asset_node.parm("asset_name")
            asset_root_directory = create_asset_node.parm("temp_asset_directory")
            # todo: specify LOD paths
            asset_name.set(assetname)
            asset_root_directory.set(source_folder)

            create_asset_node.setDisplayFlag(True)
            create_asset_node.setCurrent(True, True)