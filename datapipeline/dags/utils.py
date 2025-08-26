import csv
from io import StringIO
from typing import IO
import pandas as pd

def csvIO_to_stringIO(input_io: IO, fields: list[str]) -> StringIO:
    """
    Convert a CSV IO object to a StringIO object with specific fields.
    """
    csv_IO_to_load = StringIO()

    df = pd.read_csv(input_io)
    df = df[fields]
    for field in fields:
        if field not in df.columns:
            df[field] = None
    df.to_csv(csv_IO_to_load, index=False, quotechar='"', quoting=csv.QUOTE_MINIMAL)
    csv_IO_to_load.seek(0) #YOU MUST SEEK THE POINTER TO 0 OR ELSE COPY_EXPERT WON'T COPY IN THE END

    return csv_IO_to_load