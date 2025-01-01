export interface Track {
    title: string;
    artist: string;
    url: string;
}

export interface TrackDuration { 
    duration: number;
    currentTime: number;
    progress: number; 
}
