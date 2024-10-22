import { Button, CloseButton, Flex, Text } from '@chakra-ui/react';

type ProjectBannerProps = {
  isOpen: boolean;
  onClickSave: any;
  closeBanner: any;
  project: any;
};

const ProjectBanner = ({
  isOpen,
  onClickSave,
  closeBanner,
  project,
}: ProjectBannerProps) => {
  return isOpen ? (
    <Flex width={'100%'} alignItems={'center'} background={'yellow.100'}>
      <Flex
        p={1}
        justifyContent={'center'}
        alignItems={'center'}
        fontSize={'sm'}
        grow={1}
      >
        <Text>Project is not saved!</Text>
        <Button ml={2} size='xs' colorScheme='yellow' onClick={onClickSave}>
          Save
        </Button>
      </Flex>
      <CloseButton size='sm' mb={0} onClick={closeBanner} />
    </Flex>
  ) : (
    <></>
  );
};

export default ProjectBanner;
