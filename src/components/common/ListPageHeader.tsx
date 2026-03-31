import { Box, Button } from "@mui/material";

type ListPageHeaderProps = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
};

/** 목록 상단: 제목 + 주요 버튼(추가 등) */
export function ListPageHeader({
  title,
  actionLabel,
  onAction,
}: ListPageHeaderProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { sm: "center" },
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      <Box component="h1" sx={{ fontSize: "1.5rem", fontWeight: 600, m: 0 }}>
        {title}
      </Box>
      {actionLabel != null && onAction != null ? (
        <Button variant="contained" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </Box>
  );
}
