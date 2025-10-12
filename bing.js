// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.349
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
var default_search_words = ["树立世界妇女事业发展新的里程碑", "哈工大学生毕业就找不到？校长：属实", "美军已开始抵达以色列", "未来战场看“鸟群”出击", "四川芦山发生地震：母亲紧紧抱住孩子", "阿富汗巴基斯坦冲突：子弹穿梭如激光", "净网：2人摆拍悬赏20万寻恩人被拘", "冰箱贴已经比冰箱贵了", "闻泰科技147亿半导体资产被荷兰冻结", "员工挪桌打碎百万玉镯 老板：不用赔", "女子大兴安岭自驾游偶遇猞猁和驼鹿", "阿富汗与巴基斯坦交火 巴总理发声", "男子捅刺妻子：因买肉便宜疑其出轨", "比特币又跳水", "为什么商场里的马桶越来越多", "车牌晋A99999劳斯莱斯将司法拍卖", "美国女子在迪士尼鬼屋被吓死", "朝鲜“最强核武”亮相 哪个国家会怕", "日本新首相或许不是高市早苗 而是他", "普京即将公布神秘新武器是什么", "暴雨大暴雨！明起气温将有大变化", "卡塔尔3外交官车祸丧生 哈马斯发声", "美国女演员因屁股注射硅胶死亡", "王老吉：有病去医院 有事找法院", "菲船只恶意擦碰中国海警船 视频公布", "多国领导人到访 朝鲜迎来外交潮", "山东航空回应空姐换穿平底鞋", "激烈冲突后巴基斯坦和阿富汗发声", "为什么贷款骚扰电话突然变少了", "上海一快餐店炸鸭腿吃出多只活蛆", "市场监管总局回应高通被立案调查", "景区回应部分设计被指画风诡异", "南方的冷空气快到货了", "无人岛现巨大垃圾天坑", "日本一女子当着警察面砍死83岁邻居", "商务部公告附件首次改为wps格式", "美政府发薪日大裁员 第二天：裁错了", "印度亚锦赛惊现鸟屎 王曼昱看笑了", "欧洲多国爆发游行示威", "福州同意曹德旺筹新校 办学层次高中", "靠保险吃保险！刘安林被开除党籍", "东北虎“完达山一号”再现黑龙江", "四川雅安芦山县发生4.7级地震", "美国新产大豆输华装船为“零”", "顾客买到10个小时后生产的饮料", "律师：王暖暖离婚案50万赔偿罕见", "3.6亿买徐翔母亲股权的资金来源曝光", "美政府停摆 特朗普要求确保发军饷", "丽江一景区部分设计被指观感不适", "殡葬服务中心人员受贿94万获刑3年", "3名官员车祸身亡 卡塔尔大使馆发声"]

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
