import { useEffect, useState } from "react";
import "./like-button.css";
import likeIcon from "../../assets/icons/like.png";
import axios from "utils/api";

export default function LikeButton({
  initialState,
  setLikeLocations,
  like_locations,
  location,
}) {
  const [likeState, setLikeState] = useState(false);
  useEffect(() => {
    console.log("initialState", initialState);
    setLikeState(initialState);
  }, []);

  const handle_click = async (e) => {
    e.preventDefault();

    console.log("Like button state:", likeState);
    const copy = [...like_locations];
    if (!likeState) {
      copy.push(location);
      setLikeLocations(copy);
    } else {
      setLikeLocations(
        copy.filter(
          (loc) => loc.identification_number !== location.identification_number
        )
      );
    }
    setLikeState(!likeState);
  };

  return (
    <div className={likeState ? "like" : "dislike"} onClick={handle_click}>
      <img src={likeIcon} className="like-img" alt="Like" />
    </div>
  );
}
