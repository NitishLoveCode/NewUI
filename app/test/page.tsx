'use client';

import useWebRTC from '@/hooks/testSocketHook/useWebRTC';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, SkipForward, LogOut, Play } from 'lucide-react';

const STATUS_LABEL: Record<string, { text: string; dot: string }> = {
    idle: { text: 'Idle', dot: 'bg-zinc-500' },
    queued: { text: 'Waiting for a stranger…', dot: 'bg-amber-400 animate-pulse' },
    matched: { text: 'Connected', dot: 'bg-emerald-500' },
    partner_left: { text: 'Stranger left — finding a new one…', dot: 'bg-rose-500 animate-pulse' },
};

export default function TestMatchPage() {
    const {
        localVideoRef,
        remoteVideoRef,
        isConnected,
        socketId,
        status,
        roomId,
        partnerId,
        isMuted,
        isCameraOff,
        joinQueue,
        skip,
        leave,
        toggleMic,
        toggleCamera,
    } = useWebRTC();

    const inSession = status === 'matched' || status === 'queued' || status === 'partner_left';
    const label = STATUS_LABEL[status] ?? STATUS_LABEL.idle;

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
            <div className="mx-auto max-w-5xl space-y-4">
                {/* Header */}
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold">Anonymous Match</h1>
                        <p className="text-xs text-zinc-400">
                            Socket:{' '}
                            <span className={isConnected ? 'text-emerald-400' : 'text-rose-400'}>
                                {isConnected ? 'connected' : 'disconnected'}
                            </span>
                            {socketId && (
                                <span className="ml-2 font-mono text-zinc-500">
                                    {socketId.slice(0, 8)}
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-full bg-zinc-900 px-3 py-1.5 text-xs">
                        <span className={`size-2 rounded-full ${label.dot}`} />
                        <span>{label.text}</span>
                    </div>
                </header>

                {/* Videos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <VideoTile
                        title="You"
                        videoRef={localVideoRef}
                        muted
                        badge={isCameraOff ? 'camera off' : undefined}
                    />
                    <VideoTile
                        title="Stranger"
                        videoRef={remoteVideoRef}
                        placeholder={
                            status === 'matched'
                                ? 'Connecting video…'
                                : status === 'queued'
                                    ? 'Waiting for someone to join…'
                                    : status === 'partner_left'
                                        ? 'They disconnected. Looking for a new match…'
                                        : 'Press Start to find a stranger.'
                        }
                    />
                </div>

                {/* Session meta */}
                {(roomId || partnerId) && (
                    <div className="rounded-md bg-zinc-900/60 px-3 py-2 text-[11px] text-zinc-400 font-mono flex flex-wrap gap-x-6 gap-y-1">
                        {roomId && <span>room: {roomId}</span>}
                        {partnerId && <span>partner: {partnerId}</span>}
                    </div>
                )}

                {/* Controls */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    {!inSession ? (
                        <Button size="lg" onClick={joinQueue} disabled={!isConnected}>
                            <Play /> Start
                        </Button>
                    ) : (
                        <>
                            <Button size="lg" variant="secondary" onClick={skip}>
                                <SkipForward /> Skip
                            </Button>
                            <Button size="lg" variant="destructive" onClick={leave}>
                                <LogOut /> Leave
                            </Button>
                        </>
                    )}

                    <div className="mx-2 h-6 w-px bg-zinc-800" />

                    <Button
                        size="lg"
                        variant={isMuted ? 'destructive' : 'outline'}
                        onClick={toggleMic}
                    >
                        {isMuted ? <MicOff /> : <Mic />}
                        {isMuted ? 'Unmute' : 'Mute'}
                    </Button>
                    <Button
                        size="lg"
                        variant={isCameraOff ? 'destructive' : 'outline'}
                        onClick={toggleCamera}
                    >
                        {isCameraOff ? <VideoOff /> : <Video />}
                        {isCameraOff ? 'Camera on' : 'Camera off'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

function VideoTile({
    title,
    videoRef,
    muted,
    badge,
    placeholder,
}: {
    title: string;
    videoRef: React.RefObject<HTMLVideoElement | null>;
    muted?: boolean;
    badge?: string;
    placeholder?: string;
}) {
    return (
        <div className="relative aspect-video overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={muted}
                className="size-full object-cover"
            />
            {placeholder && (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-zinc-500 pointer-events-none">
                    {placeholder}
                </div>
            )}
            <div className="absolute left-2 top-2 rounded bg-black/50 px-2 py-0.5 text-[11px] font-medium backdrop-blur">
                {title}
            </div>
            {badge && (
                <div className="absolute right-2 top-2 rounded bg-rose-500/80 px-2 py-0.5 text-[11px] font-medium">
                    {badge}
                </div>
            )}
        </div>
    );
}
