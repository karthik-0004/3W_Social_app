import {
  Card,
  CardContent,
  Skeleton,
  Stack,
  useTheme,
} from '@mui/material'

function PostSkeletonItem() {
  const theme = useTheme()
  const isLight = theme.palette.mode === 'light'

  return (
    <Card
      sx={{
        borderRadius: 3,
        '& .MuiSkeleton-root': {
          background: isLight
            ? 'linear-gradient(90deg, #E8E6FF 25%, #F0EFFF 50%, #E8E6FF 75%)'
            : 'linear-gradient(90deg, #0F1623 25%, #161E2E 50%, #0F1623 75%)',
          backgroundSize: '800px 100%',
          animation: 'shimmer 1.8s linear infinite',
        },
        '@keyframes shimmer': {
          from: { backgroundPosition: '-400px 0' },
          to: { backgroundPosition: '400px 0' },
        },
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Skeleton variant="circular" width={42} height={42} animation="wave" />
            <Stack spacing={0.6} sx={{ flex: 1 }}>
              <Skeleton variant="text" width="35%" animation="wave" />
              <Skeleton variant="text" width="20%" animation="wave" />
            </Stack>
          </Stack>
          <Skeleton variant="text" width="92%" animation="wave" />
          <Skeleton variant="text" width="65%" animation="wave" />
          <Skeleton variant="rounded" width="100%" height={220} animation="wave" />
          <Stack direction="row" spacing={2}>
            <Skeleton variant="rounded" width={90} height={32} animation="wave" />
            <Skeleton variant="rounded" width={120} height={32} animation="wave" />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}

function PostSkeleton() {
  return (
    <Stack spacing={2}>
      {Array.from({ length: 4 }).map((_, index) => (
        <PostSkeletonItem key={index} />
      ))}
    </Stack>
  )
}

export default PostSkeleton
