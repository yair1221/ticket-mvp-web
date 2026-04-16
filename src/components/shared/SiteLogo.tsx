import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';

interface SiteLogoProps {
  size?: number;
}

export default function SiteLogo({ size = 32 }: SiteLogoProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: '#2563EB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <SportsSoccerIcon style={{ color: '#FFFFFF', fontSize: size * 0.625 }} />
    </div>
  );
}
