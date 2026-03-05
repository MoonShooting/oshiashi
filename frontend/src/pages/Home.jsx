import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import HeroSection from '../components/home/HeroSection';
import PopularArtworksSection from '../components/home/PopularArtworksSection';
import RecommendedRoutesSection from '../components/home/RecommendedRoutesSection';
import CommunityPostsSection from '../components/home/CommunityPostsSection';
import styles from '../styles/Home.module.css';

const Home = () => {
  return (
    <MainLayout isMapPage={false} activeMenuKey="home">
      <div className={styles.homeContent}>
        <HeroSection />
        <PopularArtworksSection />
        <RecommendedRoutesSection />
        <CommunityPostsSection />
      </div>
    </MainLayout>
  );
};

export default Home;
