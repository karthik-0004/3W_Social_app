import {
  Card,
  CardContent,
  Skeleton,
  Stack,
} from '@mui/material'

function PostSkeletonItem() {
  return (
    <Card sx={{ borderRadius: 3 }}>
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
