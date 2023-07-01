import requests
from pyproj import Proj, transform
import json
from pydantic import BaseModel
from typing import Optional
import math
from utils.database import get_user_facility,get_user_in_db

BASE_URL='https://data.gov.il/api/3/action/datastore_search?resource_id=f8dbd3ed-2c62-4d0e-bbaa-b6a15a0e5f7d'

class Facility(BaseModel):
    geocode: Optional[list]
    popup: Optional[str]
    local_authority: Optional[str]
    municipality: Optional[str]
    identification_number: str
    facility_type: Optional[str]
    facility_name: Optional[str]
    neighborhood_district: Optional[str]
    street: Optional[str]
    house_number: Optional[str]
    lat: Optional[float]
    lon: Optional[float]
    number_of_buildings: Optional[int]
    facility_owners: Optional[str]
    facility_operating_body: Optional[str]
    contact_person_phone: Optional[str]
    contact_person_email: Optional[str]
    number_of_seats: Optional[int]
    available_for_activities: Optional[str]
    existing_enclosure: Optional[str]
    existing_lighting: Optional[str]
    accessibility_for_disabled: Optional[str]
    parking_for_cars: Optional[str]
    facility_status: Optional[str]
    regulation_compliant_facility: Optional[str]
    official_competition_use: Optional[str]
    year_of_establishment: Optional[int]
    serving_person: Optional[str]

def calculate_euclidean_distance(lat1, lon1, lat2, lon2):
    # Convert latitude and longitude to radians
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    # Calculate the differences between the latitudes and longitudes
    delta_lat = lat2_rad - lat1_rad
    delta_lon = lon2_rad - lon1_rad
    
    # Calculate the square of half the chord length between the points
    a = math.sin(delta_lat / 2) ** 2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2) ** 2
    
    # Calculate the angular distance in radians
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    # Calculate the distance in kilometers (earth radius is approximately 6371 km)
    distance = 6371 * c
    
    return distance

def itm_wgs2lan_long(x,y):
    # Define the ITM and WGS84 coordinate systems
    itm = Proj(init="epsg:2039")
    wgs84 = Proj(init="epsg:4326")

    # Convert ITM coordinates to latitude and longitude
    longitude, latitude = transform(itm, wgs84, x, y)
    return latitude,longitude

def facility_serilaize(facility):
    if facility['ציר X']==None or facility['ציר Y']==None or facility['ציר X']=='' or facility['ציר Y'] =='' :
        return None
    latitude,longitude = itm_wgs2lan_long(facility['ציר X'],facility['ציר Y'])
    return Facility(
            geocode=[latitude,longitude],
            popup=facility['שם המתקן'],
            local_authority=facility['רשות מקומית'],
            municipality=facility['ישוב'],
            identification_number=facility['מספר זיהוי'],
            facility_type=facility['סוג מתקן'],
            facility_name=facility['שם המתקן'],
            neighborhood_district=facility['שכונה-רובע'],
            street=facility['רחוב'],
            house_number=facility['מספר בית'],
            lat=latitude,
            lon=longitude,
            number_of_buildings=facility['מספר המבנים'],
            facility_owners=facility['בעלי המתקן'],
            facility_operating_body=facility['גוף מפעיל המתקן'],
            contact_person_phone=facility['טלפון איש קשר'],
            contact_person_email=facility['דואל איש קשר'],
            number_of_seats=None if facility['מספר מושבים'] == None else int(facility['מספר מושבים'].replace(",", "")),
            available_for_activities=facility['פנוי לפעילות'],
            existing_enclosure=facility['גידור קיים'],
            existing_lighting=facility['תאורה קיימת'],
            accessibility_for_disabled=facility['נגישות לנכים'],
            parking_for_cars=facility['חניה לרכבים'],
            facility_status=facility['מצב המתקן'],
            regulation_compliant_facility=facility['מתקן תקני לתחרויות'],
            official_competition_use=facility['שימוש לתחרויות רשמיות'],
            year_of_establishment=facility['שנת הקמה'],
            serving_person=facility['משרת בית ספר']
            )

# filters='{"רשות מקומית":"אבו גוש"}'
def get_facility_by_filter(filters, limit=5, offset=0):
    if filters == "{}":
        return {}

    url = f'{BASE_URL}&offset={offset}'
    print("filters",filters)
    f = json.loads(filters)
    if 'q' in f:
        q = f['q']
        del f['q']
        filters = json.dumps(f)
        url = f'{url}&q={q}'
    if 'מספר תוצאות' in f:
        limit = f['מספר תוצאות']
        del f['מספר תוצאות']
        filters = json.dumps(f)
    url = f'{url}&limit={limit}'
    if filters != "{}":
        url = f'{url}&filters={filters}'
    print('######################')
    print(url)
    print('######################')
    r = requests.get(url)
    data = json.loads(r.text)
    if len(data['result']['records']) == 0:
        return []

    facilities = []
    for facility in data['result']['records']:
        print(facility)
        facility_ser = facility_serilaize(facility)
        if facility_ser is not None:
            facilities.append(facility_serilaize(facility))

    return facilities





async def get_facility_liked(user_id):
    facilities_id = await get_user_facility(user_id=user_id)
    facilities = []
    for id in facilities_id:
        facility=get_facility_by_filter(filters='{"מספר זיהוי":"'+id+'"}')[0]
        facilities.append(facility)

    return facilities