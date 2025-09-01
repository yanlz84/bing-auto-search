// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.267
// @description  自动搜索脚本
// @author       怀沙2049
// @match        https://*.bing.com/*
// @exclude      https://rewards.bing.com/*
// @license      GNU GPLv3
// @icon         https://www.bing.com/favicon.ico
// @downloadURL  https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @updateURL    https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @run-at       document-end
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

var max_rewards = 40; //重复执行的次数
//每执行4次搜索后插入暂停时间,解决账号被监控不增加积分的问题
var pause_time = 5000; // 暂停时长建议为16分钟,也就是960000(60000毫秒=1分钟)
var search_words = []; //搜索词


//默认搜索词，热门搜索词请求失败时使用
var default_search_words = ["四个“率先”总结上合组织建设成果", "九三阅兵具体安排来了", "一个万亿级经济圈正在崛起", "从三个交通枢纽看上合经贸活力", "金正恩已启程来华", "中方回应“印尼总统取消来华”", "告别信息裸奔 国家网络身份认证来啦", "中方回应俄朝军队是否参加九三阅兵", "3只飞鼠19楼跃出上演“翼装飞行”", "英烈笑了 我们泪目了", "272万网民选的军训服要来了", "“全民强制社保”系谣言", "男孩赶14小时作业双手痉挛变鸡爪状", "这些人可提前发工资", "巴黎世家8200元新包像“塑料袋”", "教育局回应中学宿舍像荒野求生基地", "家门口莫名现4000现金 业主懵了", "朴树演唱会状态不佳鞠躬道歉", "胖东来燕麦脆被指无生产日期", "天安门广场布置已基本就绪", "今起贷款买车可获贴息", "金价创历史新高 黄金股全线飙涨", "俱乐部回应樊振东德甲首秀失利", "成都一建筑工地塔吊倒塌 当地回应", "中小学生午休课桌椅“国标”出台", "男子草丛方便被蛇咬 迅速抓蛇就医", "流浪狗到商店乞食 生下小狗托付老板", "餐厅工作人员用空调水泡鸡蛋", "中方愿向阿富汗提供救灾援助", "阿富汗东北部地震已致812人死亡", "台大教授抵京被一句欢迎回家感动", "巴基斯坦总统：巴中关系举世无双", "上合“朋友圈”越来越大靠的是什么", "致伟大胜利留声亭：重温为时代而牺牲", "广州核发首张“电鸡”专用号牌", "“开学综合征”怎么解", "黄渤海区3万余艘渔船争“鲜”出海", "全国4条河流发生超警洪水", "北方气候“南方化”了吗", "卢卡申科谈及抗战历史时哽咽", "石宇奇世锦赛夺冠或迎商业价值重估", "英国3兄弟徒手划船139天横渡太平洋", "孙颖莎离场前把覃予萱叫到身边指导", "樊振东回应德甲首秀两连败", "24岁诗人战士牺牲 被称为“神八路”", "纸质火车票即将退出历史舞台", "女兵在长沙南站为退役战友弹奏钢琴", "小伙退伍返乡见爸妈第一时间敬礼", "折叠iPhone或采用侧边按键TouchID", "成都蓉城登顶中超", "韩德君官宣退役 昔日CUBA第一中锋"]

// 直接使用默认搜索词
search_words = default_search_words;
exec();

// 定义菜单命令：开始
let menu1 = GM_registerMenuCommand('开始', function () {
    GM_setValue('Cnt', 0); // 将计数器重置为0
    location.href = "https://www.bing.com/?br_msg=Please-Wait"; // 跳转到Bing首页
}, 'o');

// 定义菜单命令：停止
let menu2 = GM_registerMenuCommand('停止', function () {
    GM_setValue('Cnt', max_rewards + 10); // 将计数器设置为超过最大搜索次数，以停止搜索
}, 'o');

// 自动将字符串中的字符进行替换
function AutoStrTrans(st) {
    let yStr = st; // 原字符串
    let rStr = ""; // 插入的混淆字符，可以自定义自己的混淆字符串
    let zStr = ""; // 结果字符串
    let prePo = 0;
    for (let i = 0; i < yStr.length;) {
        let step = parseInt(Math.random() * 5) + 1; // 随机生成步长
        if (i > 0) {
            zStr = zStr + yStr.substr(prePo, i - prePo) + rStr; // 将插入字符插入到相应位置
            prePo = i;
        }
        i = i + step;
    }
    if (prePo < yStr.length) {
        zStr = zStr + yStr.substr(prePo, yStr.length - prePo); // 将剩余部分添加到结果字符串中
    }
    return zStr;
}

// 生成指定长度的包含大写字母、小写字母和数字的随机字符串
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        // 从字符集中随机选择字符，并拼接到结果字符串中
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function exec() {
    // 生成随机延迟时间
    let randomDelay = Math.floor(Math.random() * 20000) + 5000; // 生成5秒到25秒之间的随机数
    let randomString = generateRandomString(4); //生成4个长度的随机字符串
    let randomCvid = generateRandomString(32); //生成32位长度的cvid
    'use strict';

    // 检查计数器的值，若为空则设置为超过最大搜索次数
    if (GM_getValue('Cnt') == null) {
        GM_setValue('Cnt', max_rewards + 10);
    }

    // 获取当前搜索次数
    let currentSearchCount = GM_getValue('Cnt');
    // 根据计数器的值选择搜索引擎
    if (currentSearchCount <= max_rewards / 2) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1
        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    } else if (currentSearchCount > max_rewards / 2 && currentSearchCount < max_rewards) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1

        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    }
    // 实现平滑滚动到页面底部的函数
    function smoothScrollToBottom() {
         document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
}
