import React from 'react';
import { useLocation } from '@reach/router';
import styled from 'styled-components';
import MarkdownIt from 'markdown-it';
import MarkdownItAnchor from 'markdown-it-anchor';

const markdown = new MarkdownIt({
  html: true,
});

markdown.use(MarkdownItAnchor, {
  level: 2,
});

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const Table = styled.div`
  display: flex;
  flex-direction: column;

  position: sticky;
  top: 24px;

  flex: 0 0 calc(33.33% - 24px);
  height: fit-content;

  padding: 24px;
  margin-right: 24px;

  border-radius: ${({ theme }) => theme.borderRadius};

  background-color: ${({ theme }) => theme.colors.mono[300]};
`;

const TableHeader = styled.h1`
  display: block;

  font-family: ${({ theme }) => theme.font};
  font-size: ${({ theme }) => theme.type.size.label};
  font-weight: ${({ theme }) => theme.type.weight.label};
  text-transform: uppercase;
  text-align: center;

  color: ${({ theme }) => theme.colors.blue.dark};

  margin-bottom: 16px;
`;

const TableLink = styled.a`
  display: block;

  font-family: ${({ theme }) => theme.font};
  font-size: ${({ theme }) => theme.type.size.paragraph};
  font-weight: ${({ theme }) => theme.type.weight.paragraph};
  text-align: left;
  text-decoration: none;

  color: ${({ theme }) => theme.colors.blue.base};

  margin-bottom: 12px;

  &:hover {
    text-decoration: underline;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const Content = styled.div`
  font-family: ${({ theme }) => theme.font};

  h1, h2, h3, p, a {
    font-family: ${({ theme }) => theme.font};
  }

  h1, h2, h3, p {
    color: ${({ theme }) => theme.colors.mono.black};
  }

  h1 {
    font-size: ${({ theme }) => theme.type.size.title};
    font-weight: ${({ theme }) => theme.type.weight.title};

    margin-bottom: 16px;
  }

  h2 {
    font-size: ${({ theme }) => theme.type.size.header};
    font-weight: ${({ theme }) => theme.type.weight.header};

    padding-top: 12px;
    margin-bottom: 16px;
  }

  p {
    font-size: ${({ theme }) => theme.type.size.paragraph};
    font-weight: ${({ theme }) => theme.type.weight.paragraph};

    margin-bottom: 24px;
  }

  a {
    color: ${({ theme }) => theme.colors.blue.base};

    &:hover {
      color: ${({ theme }) => theme.colors.blue.dark};
    }
  }
`;

export default function Wiki(props) {
  const { campaign } = props;

  const location = useLocation();
  const [hasNavigatedToInitialHash, setHasNavigatedToInitialHash] = React.useState(!location.hash);

  React.useEffect(() => {
    if (location.hash && campaign && !hasNavigatedToInitialHash) {
      setHasNavigatedToInitialHash(true);

      const element = document.getElementById(location.hash.replace('#', ''));

      if (element) {
        element.scrollIntoView();
      }
    }
  }, [
    location.hash,
    campaign,
    hasNavigatedToInitialHash,
    setHasNavigatedToInitialHash,
  ]);

  if (!campaign) {
    return null;
  }

  const wiki = campaign.wiki || '';
  const tableOfContents = wiki
    .split('\n')
    .filter((line) => line.startsWith('## '))
    .map((line) => line.replace('## ', ''));


  return (
    <Container>
      <Table>
        <TableHeader>Contents</TableHeader>
        {tableOfContents.map((header, index) => (
          <TableLink
            key={`${index}-${header}`}
            href={`#${header.toLowerCase().replace(/ /g, '-')}`}
          >{index + 1}. {header}</TableLink>
        ))}
      </Table>
      <Content dangerouslySetInnerHTML={{ __html: markdown.render(wiki) }} />
    </Container>
  );
}
