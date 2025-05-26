import React, { useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  Launch as LaunchIcon,
  AdminPanelSettings as AdminIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useOutLink } from '../context/OutLinkContext';

const UserPage: React.FC = () => {
  const navigate = useNavigate();
  const { outLinks, loading, error, refreshOutLinks } = useOutLink();

  useEffect(() => {
    console.log('UserPage - outLinks 내용:', outLinks.map(link => ({ id: link.id, name: link.name })));
  }, [outLinks]);

  useEffect(() => {
    console.log('UserPage 컴포넌트 마운트됨');
    return () => {
      console.log('UserPage 컴포넌트 언마운트됨');
    };
  }, []);

  const handleUserPageClick = (url: string) => {
    window.open(url, '_blank');
  };

  const handleAdminPageClick = (url: string) => {
    window.open(url, '_blank');
  };

  const handleAppliedClick = () => {
    window.open('https://agent.gptko.co.kr/agent', '_blank');
  };

  const getStatusColor = (isApplied: boolean) => {
    return isApplied ? 'success' : 'warning';
  };

  const getStatusText = (isApplied: boolean) => {
    return isApplied ? '적용완료' : '미적용';
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={refreshOutLinks}>
              다시 시도
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AI Agent Hub PoC 페이지
          </Typography>
          <Button
            color="inherit"
            onClick={() => navigate('/admin')}
            startIcon={<AdminIcon />}
          >
            관리자 페이지
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            AI Agent Hub
          </Typography>
          <Typography variant="body1" color="text.secondary">
            실제 페이지 적용 전 테스트 페이지를 이용하고, 수정안을 제시해주세요.
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          {outLinks.map((outLink) => (
            <Card
              key={outLink.id}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {outLink.name}
                  </Typography>
                  <Chip
                    label={getStatusText(outLink.isApplied)}
                    color={getStatusColor(outLink.isApplied)}
                    size="small"
                    icon={outLink.isApplied ? <CheckIcon /> : undefined}
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {outLink.description}
                </Typography>
                
                <Chip
                  label={outLink.category}
                  variant="outlined"
                  size="small"
                  sx={{ mb: 2 }}
                />
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0 }}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', width: '100%' }}>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<LaunchIcon />}
                    onClick={() => handleUserPageClick(outLink.userPageUrl)}
                    sx={{ flex: 1, minWidth: '120px' }}
                  >
                    사용자 페이지
                  </Button>
                  
                  {outLink.adminPageUrl && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<AdminIcon />}
                      onClick={() => handleAdminPageClick(outLink.adminPageUrl!)}
                      sx={{ flex: 1, minWidth: '120px' }}
                    >
                      관리자 페이지
                    </Button>
                  )}
                  
                  {outLink.isApplied && (
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<CheckIcon />}
                      onClick={handleAppliedClick}
                      sx={{ width: '100%', mt: 1 }}
                    >
                      적용완료
                    </Button>
                  )}
                </Box>
              </CardActions>
            </Card>
          ))}
        </Box>

        {outLinks.length === 0 && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '300px',
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              등록된 AI 에이전트가 없습니다
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              관리자 페이지에서 새로운 AI 에이전트를 등록해보세요.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/admin')}
              startIcon={<AdminIcon />}
            >
              관리자 페이지로 이동
            </Button>
          </Box>
        )}
      </Container>

      {/* 버전 정보 푸터 */}
      <Box
        component="footer"
        sx={{
          mt: 4,
          py: 2,
          borderTop: 1,
          borderColor: 'divider',
          textAlign: 'center',
          backgroundColor: 'background.paper',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="caption" color="text.secondary">
            AI Agent Hub PoC v1.0.0 | 데이터는 서버에 안전하게 저장됩니다
          </Typography>
        </Container>
      </Box>
    </>
  );
};

export default UserPage; 