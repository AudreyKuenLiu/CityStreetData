import argparse
import logging
from sf_open_data_local_load import SfOpenDataLocalLoad 
from sf_open_data_api_load import SfOpenDataAPILoad

logging.basicConfig(
    format='[%(asctime)s] [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    level=logging.INFO)

def runJob(jobName: str):
    logging.info(f"Starting Job: {jobName}")
    match jobName:
        case "sf_open_data_local_load":
            loader = SfOpenDataLocalLoad(logging)
            loader.run()
            return
        case "sf_open_data_api_load":
            loader = SfOpenDataAPILoad(logging)
            loader.run()
            return
        case _:
            logging.error(f"Job not found: {jobName}")
            return

    return

def main():
    parser = argparse.ArgumentParser(
        prog="sf_data_pipline",
        description="pulls data from sf data and inserts them into tables"
    )
    parser.add_argument("-j", "--job")
    args = parser.parse_args()
    if(args.job != None):
        runJob(args.job)
    return

if __name__ == "__main__":
    main()